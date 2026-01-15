const mysql = require('../services/dbconnect.js');
const SystemLogger = require('../services/systemLogger.js');

class RewardsController {
    // GET /rewards/ DASHBOARD PAGE
    static getDashboard(req, res) {
        res.render("rewards", {title: "Rewards"});
    }

    // GET /rewards/load
    static async loadRewards(req, res) {
        try {
            
            if (!req.user?.id) {
                return res.status(401).json({
                    message: "Authentication required (Bearer token)"
                });
            }

            const userId = req.user.id

            const sql =`
            SELECT COALESCE(SUM(mrp_pointsAdded), 0) AS totalRewardPoints
            FROM master_reward_point mrp
            WHERE mrp.mrp_userId = ?
            AND mrp_status = 'ACTIVE'`;

            const totalResult = await mysql.Query(sql, [userId]);

            // RECENT REWARD HISTORY
            const sqlHistory =`
            SELECT
                mrp.mrp_id,
                mrp.mrp_pointsAdded,
                mrp.mrp_status,
                mrp.mrp_source,
                mrp.mrp_dateEarned,
                ma.ma_duration,
                mv.mv_code,
                CONCAT(mu.mu_firstName, " ", mu.mu_lastName) AS memberName
            FROM master_reward_point mrp
            LEFT JOIN master_attendance ma ON mrp.mrp_attendanceId = ma.ma_id
            LEFT JOIN master_voucher mv ON mrp.mrp_voucherId = mv.mv_id
            LEFT JOIN master_user mu ON mrp.mrp_userId = mu.mu_id
            WHERE mrp.mrp_userId = ?
            ORDER BY mrp_dateEarned DESC LIMIT 10`;

            const historyResult = await mysql.Query(sqlHistory, [req.user.id]);

            // SYSTEM LOGGING - SUCCESS
            await SystemLogger.logAction(
                req.user.id,
                req.ip,
                req.get("User-Agent"),
                "REWARDS_LISTED",
                "master_reward_point",
                null,
                null,
                JSON.stringify({
                    userId,
                    totalRewardPoints: totalResult[0]?.totalRewardPoints || 0
                })
            );

            res.status(200).json({
                message: "Success",
                data: {
                    totalRewardPoints: totalResult[0]?.totalRewardPoints || 0,
                    history: historyResult
                }
            });

        } catch (error) {
            // SYSTEM LOGGING - ERROR
            if(req.user?.id) {
                await SystemLogger.logAction(
                    req.user.id,
                    req.ip,
                    req.get("User-Agent"),
                    "REWARDS_LIST_FAILED",
                    "master_reward_point",
                    null,
                    null,
                    null,
                    "FAILED",
                    error.message
                );
            }
            console.error("RewardsController.loadRewards: ", error);
            res.status(500).json({
                message: "Server Error (500)",
                data: error
            });
        }
    }


    // GET /rewards/admin-load - ADMIN DASHBOARD
    static async adminLoad(req, res) {
        try {
            
            if (!req.user?.id || req.user.role !== "ADMIN") {
                return res.status(401).json({
                    message: "Admin authentication required (Bearer token)"
                });
            }

            const sql =`
            SELECT
                mrp.mrp_userId,
                CONCAT(mu.mu_firstName, " ", mu.mu_lastName) AS memberName,
                COALESCE(SUM(mrp.mrp_pointsAdded), 0) AS totalPoints,
                COUNT(mrp.mrp_id) AS transactions,
                MAX(mrp.mrp_dateEarned) AS lastActivity
            FROM master_reward_point mrp
            LEFT JOIN master_user mu ON mrp.mrp_userId = mu.mu_id
            WHERE mrp.mrp_status = 'ACTIVE'
            GROUP BY mrp.mrp_userId
            ORDER BY totalPoints DESC`;

            const result = await mysql.Query(sql);

            // SYSTEM LOGGING - SUCCESS
            await SystemLogger.logAction(
                req.user.id,
                req.ip,
                req.get("User-Agent"),
                "REWARDS_ADMIN_LISTED",
                "master_reward_point",
                null,
                null,
                JSON.stringify({
                    totalUsers: result.length,
                    topMemberPoints: result[0]?.totalPoints || 0
                })
            );

            res.status(200).json({
                message: "Success",
                data: result
            });

        } catch (error) {
            // SYSTEM LOGGING - ERROR
            if (req.user?.id) {
                await SystemLogger.logAction(
                    req.user.id,
                    req.ip,
                    req.get("User-Agent"),
                    "REWARDS_ADMIN_LIST_FAILED",
                    "master_reward_point",
                    null,
                    null,
                    null,
                    "FAILED",
                    error.message
                );
            }
            console.error("RewardsController.adminLoad: ", error);
            res.status(500).json({
                message: "Server Error (500)",
                data: error
            });
        }
    }


    // POST /rewards/convert-attendance
    static async convertAttendance(req, res) {
        try {
            
            if (!req.user?.id) {
                return res.status(401).json({
                    message: "Authentication required (Bearer token)"
                });
            }

            const { ma_id } = req.body;

            if (!ma_id) {
                return res.status(400).json({
                    message: "ma_id required"
                });
            }

            // CHECK ATTENDANCE + POINTS
            const attendance = await mysql.Query(`
                SELECT
                    ma_userId,
                    ma_pointsEarned
                FROM master_attendance
                WHERE ma_id = ?
                AND ma_checkout IS NOT NULL
                AND ma_deleted = 0`, [ma_id]);

            if (!attendance.length) {
                return res.status(404).json({
                    message: "Attendance not found or not checked out"
                });
            }

            const { userId, ma_pointsEarned } = attendance[0];

            if(!ma_pointsEarned || ma_pointsEarned <= 0) {
                return res.status(400).json({
                    message: "No points earned from this attendance"
                });
            }

            // CHECK IF ALREADY CONVERTED
            const alreadyConverted = await mysql.Query(`
                SELECT 1 FROM master_reward_point
                WHERE mrp_attendanceId = ?`, [ma_id]);

            if (alreadyConverted.length > 0) {
                return res.status(409).json({
                    message: "Attendance points already converted"
                });
            }

            // INSERT REWARD POINT
            const sql =`
            INSERT INTO master_reward_point
                (mrp_userId,
                mrp_attendanceId,
                mrp_pointsAdded,
                mrp_source)
            VALUES (?, ?, ?, 'ATTENDANCE')`;

            const result = await mysql.Query(sql, [userId, ma_id, ma_pointsEarned]);

            // SYSTEM LOGGING - SUCCESS
            await SystemLogger.logAction(
                req.user.id,
                req.ip,
                req.get("User-Agent"),
                "ATTENDANCE_POINTS_CONVERTED",
                "master_reward_point",
                result.insertId,
                null,
                JSON.stringify({
                    ma_id,
                    userId,
                    pointsConverted: ma_pointsEarned,
                    rewardId: result.insertId
                })
            );

            res.status(201).json({
                message: "Attendance points converted successfully",
                data: {
                    ma_id,
                    userId,
                    pointsConverted: ma_pointsEarned,
                    rewardId: result.insertId
                }
            });

        } catch (error) {
            // SYSTEM LOGGING - ERROR
            if(req.user?.id) {
                await SystemLogger.logAction(
                    req.user.id,
                    req.ip,
                    req.get("User-Agent"),
                    "ATTENDANCE_CONVERT_FAILED",
                    "master_reward_point",
                    null,
                    null,
                    null,
                    "FAILED",
                    error.message
                );
            }
            console.error("RewardsController.convertAttendance: ", error);
            res.status(500).json({
                message: "Server Error (500)",
                data: error
            });
        }
    }


    // POST /rewards/redeem-voucher
    static async redeemVoucher(req, res) {
        try {
            
            if (!req.user?.id) {
                return res.status(401).json({
                    message: "Authentication required (Bearer token)"
                });
            }

            const { voucherId } = req.body;

            if (!voucherId) {
                return res.status(400).json({
                    message: "voucherId required"
                });
            }

            const userId = req.user.id;

            // CHECK USER POINT BALANCE
            const pointsCheck = await mysql.Query(`
                SELECT COALESCE(SUM(mrp_pointsAdded), 0) AS totalPoints
                FROM master_reward_point
                WHERE mrp_userId = ?
                AND mrp_status = 'ACTIVE'`, [userId]);

            const userPoints = pointsCheck[0].totalPoints;

            // GET VOUCHER DETAILS
            const voucher = await mysql.Query(`
                SELECT
                    mv_code,
                    mv_pointsRequired,
                    mv_status,
                    mv_maxUses,
                    mv_useCount
                FROM master_voucher
                WHERE mv_id = ?`, [voucherId]);

            // VALIDATION
            if (!voucher.length) {
                return res.status(404).json({
                    message: "Voucher not found"
                });
            }

            const { mv_code, mv_pointsRequired, mv_status,
                mv_maxUses, mv_useCount } = voucher[0];


            // VOUCHER VALIDATIONS
            if (mv_status != "ACTIVE") {
                return res.status(400).json({
                    message: "Voucher inactive"
                });
            }

            if (mv_useCount >= mv_maxUses) {
                return res.status(400).json({
                    message: "Maximum redemption reached"
                });
            }

            if (userPoints < mv_pointsRequired) {
                return res.status(400).json({
                    message: `Need ${mv_pointsRequired} points. You have ${userPoints}.`
                });
            }

            // ATOMIC TRANSACTION: MARK POINTS  REDEEMED + CLAIM VOUCHER
            await mysql.Query(`
                UPDATE master_reward_point
                SET
                    mrp_status = 'REDEEMED'
                WHERE mrp_userId = ?
                AND mrp_status = 'ACTIVE'
                LIMIT ?`, [userId, mv_pointsRequired]);

            // CLAIM
            const voucherResult = await mysql.Query(`
                UPDATE master_voucher
                SET
                    mv_useCount = mv_useCount + 1,
                    mv_userId = ?
                WHERE mv_id = ?`, [userId, voucherId]);


            // SYSTEM LOGGING - SUCCESS
            await SystemLogger.logAction(
                req.user.id,
                req.ip,
                req.get("User-Agent"),
                "VOUCHER_REDEEMED",
                "master_reward_point",
                null,
                null,
                JSON.stringify({
                    userId,
                    voucherId,
                    voucherCode: mv_code,
                    pointsSpent: mv_pointsRequired,
                    remainingPoints: userPoints - mv_pointsRequired
                })
            );

            res.status(200).json({
                message: "Voucher redeemed successfully",
                data: {
                    voucherId,
                    voucherCode: mv_code,
                    pointsSpent: mv_pointsRequired,
                    remainingPoints: userPoints - mv_pointsRequired
                }
            });

        } catch (error) {
            // SYSTEM LOGGING - ERROR
            if(req.user?.id) {
                await SystemLogger.logAction(
                    req.user.id,
                    req.ip,
                    req.get("User-Agent"),
                    "VOUCHER_REDEEMED_FAILED",
                    "master_reward_point",
                    null,
                    null,
                    null,
                    "FAILED",
                    error.message
                );
            }
            console.error("RewardsController.redeemVoucher: ", error);
            res.status(500).json({
                message: "Server Error (500)",
                data: error
            });
        }
    }
}

module.exports = RewardsController