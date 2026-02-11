const mysql = require('../services/dbconnect.js');
const SystemLogger = require('../services/systemLogger.js');
const bcryptjs = require('bcryptjs');


class UserController {
    // GET /users/ DASHBOARD PAGE
    static getDashboard(req, res) {
        res.render("users", {title: "Users"});
    }


    // GET /users/profile
    static async getProfile(req, res) {
        try {
            
            if (!req.user?.id) {
                return res.status(401).json({
                    message: "Authentication required (Bearer token)"
                });
            }

            const user = await mysql.Query(`
                SELECT
                    mu.mu_id,
                    mu.mu_username,
                    mu.mu_firstName,
                    mu.mu_lastName,
                    CONCAT(mu.mu_firstName, ' ', mu.mu_lastName) AS name,
                    CONCAT('PL-', LPAD(mu.mu_id, 6, '0')) AS memberId,
                    mu.mu_phoneNumber,
                    mu.mu_email,
                    mu.mu_role,
                    mu.mu_profileIcon,
                    mu.mu_createdAt AS joinDate,
                    mm.mm_planType,
                    mm.mm_planType AS membershipType,
                    mm.mm_endDate AS expiryDate,
                    mm.mm_nextDueDate AS nextBilling,
                    COALESCE(mus.mus_totalExperience, 0) AS totalExperience,
                    COALESCE(r.mr_name, 'BRONZE') AS currentRank,
                    r.mr_icon AS rankIcon
                FROM master_user mu
                LEFT JOIN master_membership mm ON mu.mu_id = mm.mm_userId AND mm.mm_status = 'ACTIVE'
                LEFT JOIN master_user_stats mus ON mu.mu_id = mus.mus_userId
                LEFT JOIN master_rank r ON mus.mus_currentRankId = r.mr_id
                WHERE mu.mu_id = ?`, [req.user.id]);


                if (!user.length || !user[0]) {
                    return res.status(404).json({
                        message: "User profile not found"
                    });
                }

                // SYSTEM LOGGING - SUCCESS
                await SystemLogger.logAction(
                    req.user.id,
                    req.ip,
                    req.get("User-Agent"),
                    "USER_PROFILE_VIEWED",
                    "master_user",
                    req.user.id,
                    null,
                    JSON.stringify({
                        userId: req.user.id,
                        username: user[0].mu_username,
                        membership: user[0].mm_planType,
                        rank: user[0].currentRank
                    })
                );

                res.status(200).json({
                    message: "Profile loaded",
                    data: user[0]
                });

        } catch (error) {
            // SYSTEM LOGGING - ERROR
            if(req.user?.id) {
                await SystemLogger.logAction(
                    req.user.id,
                    req.ip,
                    req.get("User-Agent"),
                    "USER_PROFILE_FAILED",
                    "master_user",
                    req.user.id,
                    null,
                    null,
                    "FAILED",
                    error.message
                );
            }
            console.error("UserController.getProfile: ", error);
            res.status(500).json({
                message: "Server Error (500)",
                data: error
            });
        }
    }


    // PUT /users/update
    static async updateProfile(req, res) {
        try {
            
            if (!req.user?.id) {
                return res.status(401).json({
                    message: "Authentication required (Bearer token)"
                });
            }

            const { phoneNumber, email, password, profileIcon } = req.body;

            // PASSWORD VALIDATION
            if (password && (typeof password !== 'string' || password.trim().length < 8)) {
                return res.status(400).json({
                    message: "Password must be at least 8 characters"
                });
            }

            // PASSWORD HASHING
            let hashedPassword = null;
            if (password && password.trim().length >= 8) {
                hashedPassword = await bcryptjs.hash(password.trim(), 12);
            }

            // CHECK UNIQUE EMAIL
            const emailSqlExist =`
            SELECT 1 FROM master_user
            WHERE mu_email = ?
            AND mu_id != ?`;
            let emailSqlResult = await mysql.Query(emailSqlExist, [email, req.user.id]);

            if (emailSqlResult.length > 0) {
                return res.status(409).json({
                    message: "Email already exists"
                });
            }

            // UPDATE PROFILE
            const sql =`
            UPDATE master_user
            SET
                mu_phoneNumber = ?,
                mu_email = ?,
                mu_password = ?,
                mu_profileIcon = ?
            WHERE mu_id = ?`;

            const result = await mysql.Query(sql, [phoneNumber,
                email, hashedPassword || null, profileIcon || null, req.user.id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            // SYSTEM LOGGING - SUCCESS
            await SystemLogger.logAction(
                req.user.id,
                req.ip,
                req.get("User-Agent"),
                "USER_PROFILE_UPDATED",
                "master_user",
                req.user.id,
                null,
                JSON.stringify({
                    userId: req.user.id,
                    fieldsUpdated: {
                        phoneNumber: !!phoneNumber,
                        email: !!email,
                        password: !!hashedPassword,
                        profileIcon: !!profileIcon
                    },
                    affectedRows: result.affectedRows
                })
            );

            res.status(200).json({
                message: "Profile updated successfully",
                affectedRows: result.affectedRows
            });

        } catch (error) {
            // SYSTEM LOGGING - ERROR
            if(req.user?.id) {
                await SystemLogger.logAction(
                    req.user.id,
                    req.ip,
                    req.get("User-Agent"),
                    "USER_PROFILE_UPDATE_FAILED",
                    "master_user",
                    req.user.id,
                    null,
                    "FAILED",
                    error.message
                );
            }
            if (error.code === "ER_DUP_ENTRY") {
                return res.status(409).json({
                    message: "Duplicated Email",
                    data: error
                });
            }

            console.error("UserController.updateProfile: ", error);
            res.status(500).json({
                message: "Server Error (500)",
                data: error
            });
        }
    }


    // GET /users/points
    static async getPoints(req, res) {
        try {
            
            if(!req.user?.id) {
                return res.status(401).json({
                    message: "Authentication required (Bearer token)"
                });
            }

            // GET TOTALS
            const totals = await mysql.Query(`
            SELECT 
                COALESCE(SUM(CASE WHEN mrp_status = 'ACTIVE'
                THEN mrp_pointsAdded ELSE 0 END), 0) AS totalBalance,
                COALESCE(SUM(mrp_pointsAdded), 0) AS totalEarned
            FROM master_reward_point 
            WHERE mrp_userId = ?`, [req.user.id]);

            // GET HISTORY DATA
            const history = await mysql.Query(`
            SELECT
                mrp_id,
                mrp_pointsAdded,
                mrp_status,
                mrp_source,
                mrp_dateEarned
            FROM master_reward_point
            WHERE mrp_userId = ?
            ORDER BY mrp_dateEarned DESC`, [req.user.id]);

            const result = totals[0];

            // SYSTEM LOGGING - SUCCESS
            await SystemLogger.logAction(
                req.user.id,
                req.ip,
                req.get("User-Agent"),
                "USER_POINTS_VIEWED",
                "master_reward_point",
                null,
                null,
                JSON.stringify({
                    userId: req.user.id,
                    totalBalance: result.totalBalance,
                    totalEarned: result.totalEarned,
                    totalRecords: history.length
                })
            );

            res.status(200).json({
                message: "Points loaded",
                totalRecords: history.length,
                data: {
                    totalBalance: parseInt(result.totalBalance || 0),
                    totalEarned: parseInt(result.totalEarned || 0),
                    history: history
                }
            });

        } catch (error) {
            // SYSTEM LOGGING - ERROR
            if(req.user?.id) {
                await SystemLogger.logAction(
                    req.user.id,
                    req.ip,
                    req.get("User-Agent"),
                    "USER_POINTS_VIEWED_FAILED",
                    "master_reward_point",
                    null,
                    null,
                    "FAILED",
                    error.message
                );
            }
            console.error("UserController.getPoints: ", error);
            res.status(500).json({
                message: "Server Error (500)"
            });
        }
    }


    // GET /users/points
    static async getMyOpenCheckin(req, res) {
        try {
            
            if (!req.user?.id) {
                return res.status(401).json({
                    message: "Authentication required (Bearer token)"
                });
            }

            // FIND USER CURRENT CHECKIN
            const openCheckin = await mysql.Query(`
                SELECT
                    ma.ma_id,
                    ma.ma_checkin,
                    TIMESTAMPDIFF(MINUTE, ma.ma_checkin, NOW()) AS durationSoFar,
                    ms.ms_sessionName,
                    COALESCE(CONCAT(coach.mu_firstName, ' ', coach.mu_lastName), "FREE WORKOUT") AS coachName
                    FROM master_attendance ma
                    LEFT JOIN master_session ms ON ma.ma_sessionId = ms.ms_id
                    LEFT JOIN master_user coach ON ms.ms_userId = coach.mu_id
                    WHERE ma.ma_userId = ?
                    AND ma.ma_checkout IS NULL
                    AND ma.ma_deleted = 0
                    ORDER BY ma.ma_checkin DESC
                    LIMIT 1`, [req.user.id]);

            // SYSTEM LOGGING - SUCCESS
            await SystemLogger.logAction(
                req.user.id,
                req.ip,
                req.get("User-Agent"),
                "USER_OPEN_CHECKIN_VIEWED",
                "master_attendance",
                openCheckin[0]?.ma_id || null,
                null,
                JSON.stringify({
                    userId: req.user.id,
                    hasOpenCheckin: !!openCheckin[0]
                })
            );

            res.status(200).json({
                message: "Open checkin status loaded",
                data: openCheckin[0] || null
            });

        } catch (error) {
            // SYSTEM LOGGING - ERROR
            if(req.user?.id) {
                await SystemLogger.logAction(
                    req.user.id,
                    req.ip,
                    req.get("User-Agent"),
                    "USER_OPEN_CHECKIN_FAILED",
                    "master_attendance",
                    null,
                    null,
                    null,
                    "FAILED",
                    error.message
                );
            }
            console.error("UserController.getMyOpenCheckin: ", error);
            res.status(500).json({
                message: "Server Error (500)"
            });
        }
    }
}

module.exports = UserController;