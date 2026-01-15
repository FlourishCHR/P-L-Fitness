const mysql = require('../services/dbconnect.js');
const SystemLogger = require('../services/systemLogger.js');

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
                result = await mysql.Query(sql, [req.user.id]);
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

            // VALIDATION
            if (!userId || userId != req.user.id) {
                return res.status(400).json({
                    message: "userId must match your account"
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
                result.insertId,    // new attendance id (ma_id)
                null,              // no old data
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

            // FETCH USER ID FROM ATTENDANCE ID
            const attendance = await mysql.Query(`
                SELECT ma_userId FROM master_attendance
                WHERE ma_id = ?`, [ma_id]);
            const userId = attendance[0]?.ma_userId;
            if (!userId) {
                return res.status(404).json({
                    message: "Attendance not found"
                });
            }

            // CALCULATE DURATION
            const durationRow = await mysql.Query(`
                SELECT TIMESTAMPDIFF(MINUTE, ma_checkin, NOW())
                AS duration FROM master_attendance
                WHERE ma_id = ?`, [ma_id]);
            const duration = durationRow[0]?.duration;

            // DEBUG
            if (duration === null || duration === undefined) {
                res.status(404).json({
                    message: "Invalid attendance record"
                });
            }

            // CHECK TODAYS POINTS FROM USER
            const todayTotal = await mysql.Query(`
                SELECT COALESCE(SUM(ma_pointsEarned), 0) AS totalToday
                FROM master_attendance
                WHERE ma_userId = ?
                AND ma_checkout IS NOT NULL
                AND DATE(ma_checkout) = CURDATE()
                AND ma_deleted = 0`, [userId]);
            const pointsEarnedToday = todayTotal[0]?.totalToday;
            const remainingPoints = 120 - pointsEarnedToday;

            if (remainingPoints <= 0) {
                return res.status(403).json({
                    message: "Daily points cap (120) reached",
                    data: {
                        pointsToday: pointsEarnedToday
                    }
                });
            }

            // CHECK WEEKLY POINTS
            const weekTotal = await mysql.Query(`
                SELECT COALESCE(SUM(ma_pointsEarned), 0) AS totalWeek
                FROM master_attendance
                WHERE ma_userId = ?
                AND ma_checkout IS NOT NULL
                AND YEARWEEK(ma_checkout) = YEARWEEK(NOW())
                AND ma_deleted = 0`, [userId]);
            const pointsEarnedWeek = weekTotal[0]?.totalWeek;
            const weeklyRemaining = 600 - pointsEarnedWeek;

            if (weeklyRemaining <= 0) {
                return res.status(403).json({
                    message: "Weekly points cap (600) reached",
                    data: {
                        pointsThisWeek: pointsEarnedWeek
                    }
                });
            }

            // CALCULATE POINTS
            const pointsThisWorkout = Math.min(duration, remainingPoints, weeklyRemaining, 120);

            // UPDATE ATTENDANCE
            const sql =`
            UPDATE master_attendance
            SET
                ma_checkout = NOW(),
                ma_duration = ?,
                ma_pointsEarned = ?
            WHERE ma_id = ?`;

            const result = await mysql.Query(sql, [duration, pointsThisWorkout, ma_id]);

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
                "ATTENDANCE_CHECKED_OUT",
                "master_attendance",
                ma_id,
                null,
                JSON.stringify({
                    duration_minutes: duration,
                    points_earned: pointsThisWorkout,
                    daily_total: pointsEarnedToday + pointsThisWorkout,
                    weekly_total: pointsEarnedWeek + pointsThisWorkout
                })
            );

            res.status(200).json({
                message: "Checkout success",
                affectedRows: result.affectedRows,
                data: {
                    ma_id,
                    duration_minutes: duration,
                    points_earned: pointsThisWorkout,
                    points_today: pointsEarnedToday + pointsThisWorkout,
                    daily_remaining: remainingPoints - pointsThisWorkout,
                    points_this_week: pointsEarnedWeek,
                    weekly_remaining: weeklyRemaining
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
                    ma_id,
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
}

module.exports = AttendanceController;