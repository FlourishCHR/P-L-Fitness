const mysql = require('../services/dbconnect.js');
const SystemLogger = require('../services/systemLogger.js');
const QRCode = require('qrcode');
const axios = require('axios');

const API_BASE = process.env.API_BASE || 'http://localhost:3000';

class AttendanceController {
    // GET /attendance/ DASHBOARD PAGE
    static getDashboard(req, res) {
        res.render("attendance", {title: "Attendance"});
    }

    // GET /attendance/load
    static async loadAttendance(req, res) {
        try {
            
            if (!req.user?.id) {
                return res.status(401).json({
                    message: "Authentication required (Bearer token)"
                });
            }

            let sql =`
            SELECT
                ma.ma_id,
                ma.ma_userId,
                CONCAT(mu.mu_firstName, ' ', mu.mu_lastName) AS memberName,
                ma.ma_sessionId,
                ms.ms_sessionName,
                COALESCE(CONCAT(coach.mu_firstName, ' ', coach.mu_lastName), 'FREE WORKOUT') AS coachName,
                ma.ma_checkin,
                ma.ma_checkout,
                ma.ma_duration,
                ma.ma_pointsEarned
            FROM master_attendance ma
            LEFT JOIN master_user mu ON ma.ma_userId = mu.mu_id
            LEFT JOIN master_session ms ON ma.ma_sessionId = ms.ms_id
            LEFT JOIN master_user coach ON ms.ms_userId = coach.mu_id
            WHERE ma.ma_deleted = 0`;

            let result;

            if (req.user.role !== "ADMIN") {
                sql += ` AND ma.ma_userId = ? ORDER BY ma.ma_checkin DESC`;
                result = await mysql.Query(sql, [req.user.id]);
            } else {
                sql += ` ORDER BY ma.ma_checkin DESC`
                result = await mysql.Query(sql);
            }

            
            // SYSTEM LOGGING - SUCCESS
            await SystemLogger.logAction (
                req.user.id,
                req.ip,
                req.get("User-Agent"),
                "ATTENDANCE LISTED",
                "master_attendance",
                null,
                null,
                null
            );

            res.status(200).json({
                message: "Success",
                data: result
            });

        } catch (error) {
            // SYSTEM LOGGING - ERROR
            if(req.user?.id) {
                await SystemLogger.logAction(
                    req.user.id,
                    req.ip,
                    req.get("User-Agent"),
                    "ATTENDANCE_LIST_FAILED",
                    "master_attendance",
                    null,
                    null,
                    null,
                    "FAILED",
                    error.message
                );
            }
            console.error("AttendanceController.loadAttendance: ", error);
            res.status(500).json({
                message: "Error fetching attendance",
                data: error
            });
        }
    }


    // POST /attendance/checkin
    static async checkin(req, res) {
        try {

            if (!req.user?.id) {
                return res.status(401).json({
                    message: "Authentication required (Bearer token)"
                });
            }

            const { userId, sessionId } = req.body;

            if (!userId) {
                return res.status(400).json({
                    message: "userId required"
                });
            }

            // VALIDATION
            if (req.user.role !== "ADMIN" && userId != req.user.id) {
                return res.status(400).json({
                    message: "userId must match your account"
                });
            }

            if (sessionId) {
                const session = await mysql.Query(`
                    SELECT ms_status
                    FROM master_session
                    WHERE ms_id = ?`, [sessionId]);

                if (!session[0] || session[0].ms_status !== "ACTIVE") {
                    return res.status(400).json({
                        message: "Session not active or not found"
                    });
                }
            }

            const existing = await mysql.Query(`
                SELECT ma_id
                FROM master_attendance
                WHERE ma_userId = ?
                AND ma_checkout IS NULL
                AND ma_deleted = 0`, [userId]);

            if (existing.length > 0) {
                return res.status(409).json({
                    message: "Already checked in"
                });
            }

            const sql =`
            INSERT INTO master_attendance
                (ma_userId,
                ma_sessionId,
                ma_checkin)
            VALUES (?, ?, NOW())`;

            const result = await mysql.Query(sql, [userId, sessionId || null]);

            // SYSTEM LOGGING - SUCCESS
            await SystemLogger.logAction(
                req.user.id,
                req.ip,
                req.get("User-Agent"),
                "ATTENDANCE_CHECKED_IN",
                "master_attendance",
                result.insertId,
                null,
                JSON.stringify({
                    userId,
                    sessionId: sessionId || 'FREE_WORKOUT'
                })
            );

            res.status(201).json({
                message: "Checkin success",
                data: {
                    ma_id: result.insertId
                }
            });

        } catch (error) {
            // SYSTEM LOGGING - ERROR
            if(req.user?.id) {
                await SystemLogger.logAction(
                    req.user.id,
                    req.ip,
                    req.get("User-Agent"),
                    "ATTENDANCE_CHECKIN_FAILED",
                    "master_attendance",
                    null,
                    null,
                    null,
                    "FAILED",
                    error.message
                );
            }
            if (error.code === "ER_DUP_ENTRY") {
                return res.status(409).json({
                    message: "Member already checked in",
                    data: error
                });
            }
            console.error("AttendanceController.checkin: ", error);
            res.status(500).json({
                message: "Server Error (500)",
                data: error
            });
        }
    }

    // GET /attendance/qrcode/checkin
    static async generateCheckInQR(req, res) {
        try {
            if (!req.user?.id) {
                return res.status(401).json({ message: "Authentication required" });
            }

            const payload = JSON.stringify({
                userId: req.user.id,
                type: "CHECKIN"
                // NO ma_id - creates NEW session when scanned
            });

            const qrDataUrl = await QRCode.toDataURL(payload);
            
            res.json({
                message: "Ready-to-checkin QR generated",
                data: {
                    userId: req.user.id,
                    checkin_qr: qrDataUrl
                }
            });
        } catch (error) {
            res.status(500).json({ message: "QR generation failed" });
        }
    }

    // PUT /attendance/checkout
    static async checkout(req, res) {
        try {
            
            if (!req.user?.id) {
                return res.status(401).json({
                    message: "Authentication required (Bearer token)"
                });
            }

            const { ma_id } = req.body;

            // VALIDATION
            if (!ma_id) {
                return res.status(400).json({
                    message: "ma_id required"
                });
            }

            // CHECK MEMBERSHIP
            const membership = await mysql.Query(`
                SELECT mm_planType
                FROM master_membership
                WHERE mm_userId = ?
                AND mm_status = "ACTIVE"
                LIMIT 1`, [req.user.id]);

            // const isPremium = membership[0]?.mm_planType === "PREMIUM"; -- dead code for now
            const isBasic = membership[0]?.mm_planType === "BASIC";

            const result = await mysql.Query(`
                SELECT
                    ma.ma_id,
                    ma.ma_userId,
                    ma.ma_checkin,
                    TIMESTAMPDIFF(MINUTE, ma.ma_checkin, NOW()) AS duration,

                    -- DAILY POINT
                    COALESCE((
                        SELECT SUM(ma2.ma_pointsEarned)
                        FROM master_attendance ma2
                        WHERE ma2.ma_userId = ma.ma_userId
                        AND ma2.ma_checkout IS NOT NULL
                        AND DATE(ma2.ma_checkout) = CURDATE()
                        AND ma2.ma_deleted = 0
                        AND ma2.ma_id != ma.ma_id
                    ), 0) AS pointsEarnedToday,

                    -- WEEKLY POINT
                    COALESCE((
                        SELECT SUM(ma3.ma_pointsEarned)
                        FROM master_attendance ma3
                        WHERE ma3.ma_userId = ma.ma_userId
                        AND ma3.ma_checkout IS NOT NULL
                        AND YEARWEEK(ma3.ma_checkout) = YEARWEEK(NOW())
                        AND ma3.ma_deleted = 0
                        AND ma3.ma_id != ma.ma_id
                    ), 0) AS pointsEarnedWeek

                FROM master_attendance ma
                WHERE ma.ma_id = ?
                AND ma.ma_checkout IS NULL
                AND ma.ma_deleted = 0`, [ma_id]);

                if (!result[0]) {
                    return res.status(404).json({
                        message: "Attendance not found or already checked out"
                    });
                }

                const {
                    ma_userId: userId,
                    duration,
                    pointsEarnedToday,
                    pointsEarnedWeek
                } = result[0];


                const dailyExpCheck = await mysql.Query(`
                    SELECT COALESCE(SUM(mex_experiencePoints), 0) as totalDailyExp
                    FROM master_experience mex
                    JOIN master_attendance ma ON mex.mex_attendanceId = ma.ma_id
                    WHERE mex.mex_userId = ?
                    AND DATE(ma.ma_checkout) = CURDATE()
                    AND mex.mex_status = 'ACTIVE'`, [userId]);

                const dailyBaseExpUsed = dailyExpCheck[0].totalDailyExp;
                const baseExpAvailable = Math.max(0, 10 - dailyBaseExpUsed);

            // USER OWNERSHIP VALIDATION
            if (userId != req.user.id && req.user.role !== "ADMIN") {
                return res.status(403).json({
                    message: "Unauthorized to checkout this attendance"
                });
            }

            // BASIC USER
            if (isBasic) {
                const duration = result[0].duration;

                await mysql.Query(`
                    UPDATE master_attendance
                    SET
                        ma_checkout = NOW(),
                        ma_duration = ?,
                        ma_pointsEarned = 0
                    WHERE ma_id = ?`, [duration, ma_id]);

                // SYSTEM LOGGING - BASIC SUCCESS
                await SystemLogger.logAction(
                    req.user.id,
                    req.ip,
                    req.get("User-Agent"),
                    "ATTENDANCE_BASIC_CHECKOUT",
                    "master_attendance",
                    ma_id,
                    null,
                    JSON.stringify({
                        duration_minutes: duration,
                        points_earned: 0,
                        exp_earned: 0,
                        membership: "BASIC (LIMITED)"
                    })
                );
                return res.status(200).json({
                    message: "Checkout success (BASIC - no points/EXP earned)",
                    data: {
                        ma_id,
                        duration_minutes: duration,
                        points_earned: 0,
                        exp_earned: 0,
                        membership: "BASIC",
                        note: "Upgrade to PREMIUM for points and experience!"
                    }
                });
            }

            // PREMIUM: POINTS CALCULATION
            const remainingPoints = Math.max(0, 120 - pointsEarnedToday);
            const weeklyRemaining = Math.max(0, 600 - pointsEarnedWeek);

            // POINT CAPPING
            const dailyCapReached = remainingPoints <= 0;
            const weeklyCapReached = weeklyRemaining <= 0;

            const pointsThisWorkout = dailyCapReached || weeklyCapReached ? 0: Math.min(duration || 0, remainingPoints, weeklyRemaining, 120);
            const workoutExp = dailyCapReached || weeklyCapReached? 0: Math.min(duration || 0, 50, remainingPoints, weeklyRemaining);
            const totalExp = baseExpAvailable + workoutExp;

            // UPDATE ATTENDANCE
            await mysql.Query(`
                UPDATE master_attendance
                SET
                    ma_checkout = NOW(),
                    ma_duration = ?,
                    ma_pointsEarned = ?
                WHERE ma_id = ?`, [duration || 0, pointsThisWorkout, ma_id]);

            // PREMIUM: ADD REWARD POINTS
            await mysql.Query(`
                INSERT INTO master_reward_point
                    (mrp_userId,
                    mrp_attendanceId,
                    mrp_pointsAdded,
                    mrp_status,
                    mrp_source,
                    mrp_dateEarned)
                VALUES (?, ?, ?, 'ACTIVE', 'WORKOUT', NOW())`, [userId, ma_id, pointsThisWorkout]);

                if (totalExp > 0) {
                    const currentExpResult = await mysql.Query(`
                        SELECT COALESCE(SUM(mex_experiencePoints), 0) AS currentTotal
                        FROM master_experience
                        WHERE mex_userId = ?
                        AND mex_status = 'ACTIVE'`, [userId]);

                    const currentTotalExp = parseInt(currentExpResult[0].currentTotal);
                    const cumulativeTotalExp = currentTotalExp + totalExp;

                    await mysql.Query(`
                        INSERT INTO master_experience
                            (mex_userId,
                            mex_attendanceId,
                            mex_experiencePoints,
                            mex_totalExperience,
                            mex_status)
                        VALUES (?, ?, ?, ?, 'ACTIVE')`, 
                        [userId, ma_id, totalExp, cumulativeTotalExp]);

                    await mysql.Query(`
                        INSERT INTO master_user_stats
                            (mus_userId,
                            mus_totalExperience)
                        SELECT ?, COALESCE(SUM(mex_experiencePoints), 0)
                        FROM master_experience
                        WHERE mex_userId = ?
                        AND mex_status = 'ACTIVE'
                        ON DUPLICATE KEY UPDATE
                        mus_totalExperience = VALUES(mus_totalExperience)`, [userId, userId])
                }

            // SYSTEM LOGGING - PREMIUM SUCCESS
            await SystemLogger.logAction(
                req.user.id,
                req.ip,
                req.get("User-Agent"),
                "ATTENDANCE_CHECKED_OUT",
                "master_attendance",
                ma_id,
                null,
                JSON.stringify({
                    duration_minutes: duration,
                    points_earned: pointsThisWorkout,
                    workout_exp: totalExp,
                    total_exp_attendance: totalExp,
                    base_exp_used: baseExpAvailable,
                    daily_total: pointsEarnedToday + pointsThisWorkout,
                    weekly_total: pointsEarnedWeek + pointsThisWorkout,
                    reward_point_inserted: true
                })
            );

            res.status(200).json({
                message: "Checkout success",
                data: {
                    ma_id,
                    duration_minutes: duration,
                    workout_exp: totalExp,
                    total_exp_attendance: totalExp,
                    points_earned: dailyCapReached ? 0 : pointsThisWorkout,
                    base_exp_remaining: Math.max(0, 10 - dailyBaseExpUsed),
                    points_today: pointsEarnedToday + (dailyCapReached ? 0 : pointsThisWorkout),
                    daily_remaining: Math.max(0, remainingPoints - (dailyCapReached ? 0 : pointsThisWorkout)),
                    points_this_week: pointsEarnedWeek + (weeklyCapReached ? 0 : pointsThisWorkout),
                    weekly_remaining: Math.max(0, weeklyRemaining - (weeklyCapReached ? 0 : pointsThisWorkout)),
                    membership: "PREMIUM",
                    reward_point_inserted: !dailyCapReached && !weeklyCapReached,

                    warnings: [
                    ...(dailyCapReached ? ["Daily points cap (120) reached, no extra points for this workout"] : []),
                    ...(weeklyCapReached ? ["Weekly points cap (600) reached, no extra points for this workout"] : []),
                    ...(baseExpAvailable === 0 ? ["Daily first-checkin bonus (10 EXP) already used"] : []),
                    ...(workoutExp === 0 && !dailyCapReached && !weeklyCapReached ? ["Daily workout EXP cap (50) reached, no workout EXP earned"] : [])
                    ]
                }
            });

        } catch (error) {
            // SYSTEM LOGGING - ERROR
            if (req.user?.id) {
                await SystemLogger.logAction(
                    req.user.id,
                    req.ip,
                    req.get("User-Agent"),
                    "ATTENDANCE_CHECKOUT_FAILED",
                    "master_attendance",
                    ma_id || null,
                    null,
                    null,
                    "FAILED",
                    error.message
                );
            }
            if (error.code === "ER_DUP_ENTRY") {
                return res.status(409).json({
                    message: "Duplicated Entry",
                    data:error
                });
            }
            console.error("AttendanceController.checkout: ", error);
            res.status(500).json({
                message: "Server Error (500)",
                data: error
            });
        }
    }


    // GET /attendance/qrcode/checkout/:ma_id
    static async generateCheckoutQR(req, res) {
        try {
            if (!req.user?.id) {
                return res.status(401).json({
                    message: "Authentication required"
                });
            }

            const result = await mysql.Query(`
                SELECT ma_id
                FROM master_attendance 
                WHERE ma_userId = ?
                AND ma_checkout IS NULL
                AND ma_deleted = 0 
                ORDER BY ma_checkin DESC
                LIMIT 1`, [req.user.id]);

            if (!result[0]) {
                return res.status(404).json({
                    message: "No open session to checkout"
                });
            }

            const payload = JSON.stringify({
                ma_id: result[0].ma_id,
                userId: req.user.id,
                type: "CHECKOUT"
            });

            const qrDataUrl = await QRCode.toDataURL(payload);
            
            res.json({
                message: "Ready-to-checkout QR generated",
                data: {
                    ma_id: result[0].ma_id,
                    checkout_qr: qrDataUrl
                }
            });
        } catch (error) {
            res.status(500).json({ message: "QR generation failed" });
        }
    }

    // PUT /attendance/delete
    static async deleteAttendance(req, res) {
        try {
            
            if (!req.user?.id || req.user.role !== "ADMIN") {
                return res.status(401).json({
                    message: "Admin authentication required (Bearer token)"
                });
            }

            const { id } = req.body;

            if (!id) {
                return res.status(400).json({
                    message: "id required"
                });
            }

            const sql =`
            UPDATE master_attendance
            SET ma_deleted = 1
            WHERE ma_id = ?`;

            const result = await mysql.Query(sql, [id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Attendance not found"
                });
            }

            // SYSTEM LOGGING - SUCCESS
            await SystemLogger.logAction(
                req.user.id,
                req.ip,
                req.get("User-Agent"),
                "ATTENDANCE_DELETED",
                "master_attendance",
                id,
                null,
                JSON.stringify({ ID: id })
            );

            res.status(200).json({
                message: "Attendance deleted successfully",
                data: {id}
            });

        } catch (error) {
            // SYSTEM LOGGING - ERROR
            if(req.user?.id) {
                await SystemLogger.logAction(
                    req.user.id,
                    req.ip,
                    req.get("User-Agent"),
                    "ATTENDANCE_DELETE_FAILED",
                    "master_attendance",
                    id,
                    null,
                    null,
                    "FAILED",
                    error.message
                );
            }
            if (error.code === "ER_DUP_ENTRY") {
                return res.status(409).json({
                    message: "Duplicated Entry",
                    data: error
                });
            }
            console.error("AttendanceController.deleteAttendance: ", error);
            res.status(500).json({
                message: "Server Error (500)",
                data: error
            });
        }
    } 


    // GET /attendance/staff/scan
    static async staffScan(req, res) {
        try {

            const { data } = req.query;
            
            if (!req.user?.id || req.user.role !== "ADMIN") {
                return res.status(401).json({
                    message: "Admin authentication required (Bearer token)"
                });
            }
            console.log("ADMIN CHECK PASSED");

            if (!data) {
                return res.status(400).json({
                    error: "No QR data found. Scan a valid checkin/checkout QR."
                });
            }

            let qrData;
            try {
                qrData = JSON.parse(decodeURIComponent(data));
            } catch (error) {
                return res.status(400).json({
                    message: "Invalid QR data. Generate QR from app first."
                });
            }

            const { ma_id, userId, type } = qrData;

            if (!userId || !type || !["CHECKIN", "CHECKOUT"].includes(type)) {
                return res.status(400).json({
                    message: "Invalid QR format"
                });
            }

            const headers = {
                Authorization: req.headers.authorization,
                'Content-Type': 'application/json'
            };

            try {
                
                if (type === "CHECKIN") {
                    const checkinRes = await axios.post(
                        `${API_BASE}/attendance/checkin`,
                        { userId },
                        { headers }
                    );

                // SYSTEM LOGGING - SUCCESS
                await SystemLogger.logAction(
                    req.user.id,
                    req.ip,
                    req.get("User-Agent"),
                    "STAFF_CHECKIN_SUCCESS",
                    "master_attendance",
                    checkinRes.data.data.ma_id,
                    null,
                    JSON.stringify({
                        userId,
                        targetUserId: userId
                    })
                );

                return res.status(200).json({
                    message: "Staff scan processed: checked in",
                    type: "CHECKIN",
                    userId,
                    ma_id: checkinRes.data.data.ma_id,
                    attendanceData: checkinRes.data
                });
                }

                if (type === "CHECKOUT") {
                    const checkoutRes = await axios.put(
                        `${API_BASE}/attendance/checkout`,
                        { ma_id },
                        { headers }
                    );

                // SYSTEM LOGGING - SUCCESS
                await SystemLogger.logAction(
                    req.user.id,
                    req.ip,
                    req.get("User-Agent"),
                    "STAFF_CHECKOUT_SUCCESS",
                    "master_attendance",
                    ma_id,
                    null,
                    JSON.stringify({
                        userId,
                        ma_id,
                        duration: checkoutRes.data.data.duration_minutes,
                        points: checkoutRes.data.data.points_earned
                    })
                );

                return res.status(200).json({
                    message: "Staff scan processed: checked out",
                    type: "CHECKOUT",
                    userId,
                    ma_id,
                    attendanceData: checkoutRes.data
                });
                }

                return res.status(400).json({
                    message: "Unknown QR type"
                });

            } catch (apiError) {
                // SYSTEM LOGGING - ERROR
                await SystemLogger.logAction(
                    req.user.id,
                    req.ip,
                    req.get("User-Agent"),
                    "STAFF_SCAN_API_FAILED",
                    "master_attendance",
                    null,
                    null,
                    null,
                    "FAILED",
                    apiError.response?.data?.message || apiError.message
                );
                const msg = apiError.response?.data?.message ||
                apiError.message || "Failed to call attendance API";

                return res.status(apiError.response?.status || 500).json({
                    message: msg,
                    originalError: process.env.NODE_ENV === 'development' ? apiError.response?.data : undefined
                });
            }

        } catch (error) {
            if (req.user?.id) {
                await SystemLogger.logAction(
                    req.user.id,
                    req.ip,
                    req.get("User-Agent"),
                    "STAFF_SCAN_FAILED",
                    "master_attendance",
                    null,
                    null,
                    null,
                    "FAILED",
                    error.message
                );
            }
            console.error("Staff scan error: ", error);
            return res.status(500).json({
                message: "Server Error (500)"
            });
        }
    }
}

module.exports = AttendanceController;