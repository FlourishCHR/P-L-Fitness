const mysql = require('../services/dbconnect.js');
const SystemLogger = require('../services/systemLogger.js');

class AchievementsController {
    // GET /achievements/ DASHBOARD PAGE
    static getDashboard(req, res) {
        res.render("achievements", {title: "Achievements"});
    }

    // LOAD /achievements/load
    static async loadAchievements(req, res) {
        try {
            
            if (!req.user?.id) {
                return res.status(401).json({
                    message: "Authentication required (Bearer token)"
                });
            }

            const sql =`
            SELECT * FROM master_achievement
            ORDER BY mac_id DESC`;

            const result = await mysql.Query(sql);

            // SYSTEM LOGGING - SUCCESS
            await SystemLogger.logAction(
                req.user.id,
                req.ip,
                req.get("User-Agent"),
                "ACHIEVEMENTS_LISTED",
                "master_achievement",
                null
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
                    "ACHIEVEMENT_LIST_FAILED",
                    "master_achievement",
                    null,
                    null,
                    null,
                    "FAILED",
                    error.message
                );
            }
            console.error("AchievementsController.loadAchievements: ", error);
            res.status(500).json({
                message: "Error fetching achievements",
                data: error
            });
        }
    }


    // POST /achievements/insert
    static async createAchievement(req, res) {
        try {
            
            if (!req.user?.id || req.user.role !== "ADMIN") {
                return res.status(401).json({
                    message: "Admin authentication required (Bearer token)"
                });
            }

            const { name, description, requiredExperience, pointsAwarded, 
                experienceAwarded, icon, status } = req.body;

            // VALIDATION
            if (!name || requiredExperience === undefined) {
                return res.status(400).json({
                    message: "name, requiredExperience required",
                    validStatus: ["ACTIVE", "INACTIVE", "DELETED"]
                });
            }

            const sql =`
            INSERT INTO master_achievement
                (mac_name,
                mac_description,
                mac_requiredExperience,
                mac_pointsAwarded,
                mac_experienceAwarded,
                mac_icon,
                mac_status)
            VALUES (?, ?, ?, ?, ?, ?, ?)`;

            const result = await mysql.Query(sql, [name, description || null,
                parseInt(requiredExperience), parseInt(pointsAwarded),
                parseInt(experienceAwarded), icon || null, status || "ACTIVE"]);

            // SYSTEM LOGGING - SUCCESS
            await SystemLogger.logAction(
                req.user.id,
                req.ip,
                req.get("User-Agent"),
                "ACHIEVEMENT CREATED",
                "master_achievement",
                result.insertId,
                null,
                JSON.stringify({
                    name,
                    requiredExperience: parseInt(requiredExperience),
                    description,
                    status: status || "ACTIVE"
                })
            );

            res.status(201).json({
                message: "Achievement created successfully",
                data: {
                    id: result.insertId,
                    name,
                    requiredExperience: parseInt(requiredExperience)
                }
            });

        } catch (error) {
            // SYSTEM LOGGING - ERROR
            if (req.user?.id) {
                await SystemLogger.logAction(
                    req.user.id,
                    req.ip,
                    req.get("User-Agent"),
                    "ACHIEVEMENT_CREATE_FAILED",
                    "master_achievement",
                    null,
                    null,
                    null,
                    "FAILED",
                    error.message
                );
            }
            if (error.code === "ER_DUP_ENTRY") {
                return res.status(409).json({
                    message: "Duplicate achievement name",
                    data: error
                });
            }
            console.error("AchievementsController.createAchievement: ", error);
            res.status(500).json({
                message: "Server Error (500)",
                data: error
            });
        }
    }


    // PUT /achievements/update
    static async updateAchievement(req, res) {
        try {
            
            if (!req.user?.id || req.user.role !== "ADMIN") {
                return res.status(401).json({
                    message: "Admin authentication required (Bearer token)"
                });
            }

            const { id, name, description, requiredExperience, 
               pointsAwarded, experienceAwarded, icon, status } = req.body;

            // VALIDATION
            if (!id || !name || requiredExperience === undefined) {
                return res.status(400).json({
                    message: "id, name, requiredExperience required"
                });
            }

            const sql =`
            UPDATE master_achievement
            SET
                mac_name = ?,
                mac_description = ?,
                mac_requiredExperience = ?,
                mac_pointsAwarded = ?,
                mac_experienceAwarded = ?,
                mac_icon = ?,
                mac_status = ?
            WHERE mac_id = ?`;

            const result = await mysql.Query(sql, [name, description || null,
                parseInt(requiredExperience), parseInt(pointsAwarded),
                parseInt(experienceAwarded), icon || null, status || "ACTIVE", id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Achievement not found"
                });
            }

            // SYSTEM LOGGING - SUCCESS
            await SystemLogger.logAction(
                req.user.id,
                req.ip,
                req.get("User-Agent"),
                "ACHIEVEMENT_UPDATED",
                "master_achievement",
                id
            );

            res.status(200).json({
                message: "Achievement updated successfully",
                affectedRows: result.affectedRows
            });

        } catch (error) {
            // SYSTEM LOGGING - ERROR
            if (req.user?.id) {
                await SystemLogger.logAction(
                    req.user.id,
                    req.ip,
                    req.get("User-Agent"),
                    "ACHIEVEMENT_UPDATE_FAILED",
                    "master_achievement",
                    null,
                    null,
                    null,
                    "FAILED",
                    error.message
                );
            }
            if (error.code === "ER_DUP_ENTRY") {
                return res.status(409).json({
                    message: "Duplicate achievement name",
                    data: error
                });
            }
            console.error("AchievementsController.updateAchievement: ", error);
            res.status(500).json({
                message: "Server Error (500)",
                data: error
            });
        }
    }


    // PUT /achievements/delete
    static async deleteAchievement(req, res) {
        try {
            
            if (!req.user?.id || req.user.role !== "ADMIN") {
                return res.status(401).json({
                    message: "Admin authentication required (Bearer token)"
                });
            }

            const { id } = req.body;

            // VALIDATION
            if (!id || isNaN(id)) {
                return res.status(400).json({
                    message: "Valid ID required"
                });
            }

            const sql =`
            UPDATE master_achievement
            SET mac_status = 'DELETED'
            WHERE mac_id = ?`;

            const result = await mysql.Query(sql, [id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Achievement not found"
                });
            }

            // SYSTEM LOGGING - SUCCESS
            await SystemLogger.logAction(
                req.user.id,
                req.ip,
                req.get("User-Agent"),
                "ACHIEVEMENT_DELETED",
                "master_achievement",
                id,
                null,
                JSON.stringify({
                    id
                })
            );

            res.status(200).json({
                message: "Achievement has been soft-deleted",
                affectedRows: result.affectedRows
            });

        } catch (error) {
            // SYSTEM LOGGING - ERROR
            if (req.user?.id) {
                await SystemLogger.logAction(
                    req.user.id,
                    req.ip,
                    req.get("User-Agent"),
                    "ACHIEVEMENT_DELETE_FAILED",
                    "master_achievement",
                    id,
                    null,
                    null,
                    "FAILED",
                    error.message
                );
            }
           console.error("AchievementsController.deleteAchievement: ", error);
            res.status(500).json({
                message: "Server Error (500)",
                data: error
            });
        }
    }


    // GET /achievements/user
    static async getUserAchievements(req, res) {
        try {
            
            if (!req.user?.id) {
                return res.status(401).json({
                    message: "Authentication required (Bearer token)"
                });
            }

            const userId = req.params.userId || req.user.id;

            const sql =`
            SELECT
                mac.mac_id,
                mac.mac_name,
                mac.mac_description,
                mac.mac_requiredExperience,
                mac.mac_icon,
                mac.mac_pointsAwarded,
                mac.mac_experienceAwarded,
                mua.mua_id,
                mua.mua_dateUnlocked,
                CASE WHEN mua.mua_id IS NOT NULL THEN 'UNLOCKED' ELSE 'LOCKED' END AS status,
                COALESCE(SUM(mex.mex_experiencePoints), 0) as user_total_xp
            FROM master_achievement mac
            LEFT JOIN master_user_achievement mua ON mac.mac_id = mua.mua_achievementId
            AND mua.mua_userId = ?
            AND mua.mua_status = 'ACTIVE'
            LEFT JOIN master_experience mex ON mex.mex_userId = ?
            WHERE mac.mac_status = 'ACTIVE'
            GROUP BY mac.mac_id, mua.mua_id, mua.mua_dateUnlocked
            ORDER BY mac.mac_requiredExperience`;

            const [result] = await mysql.Query(sql, [userId, userId])

            // SYSTEM LOGGING - SUCCESS
            await SystemLogger.logAction(
                req.user.id,
                req.ip,
                req.get("User-Agent"),
                "USER_ACHIEVEMENTS_VIEWED",
                "master_achievement",
                null
            );

            res.status(200).json({
                message: "User achievements",
                data: result
            });

        } catch (error) {
        // SYSTEM LOGGING - ERROR
        if (req.user?.id) {
            await SystemLogger.logAction(
                req.user.id,
                req.ip,
                req.get("User-Agent"),
                "USER_ACHIEVEMENTS_FAILED",
                "master_achievement",
                null,
                null,
                null,
                "FAILED",
                error.message
            );
        }
        console.error("AchievementsController.getUserAchievements: ", error);
        res.status(500).json({
            message: "Server Error (500)"
        });
    }
}


    // POST /achievements/check
    static async checkAchievements(req, res) {
        try {
            
            if (!req.user?.id) {
                return res.status(401).json({
                    message: "Authentication required (Bearer token)"
                });
            }

            const userId = req.user.id;
            const awarded = [];

            // GET USER TOTAL EXP
            const userStats = await mysql.Query(`
                SELECT COALESCE(SUM(mex.mex_experiencePoints), 0) as total_xp
                FROM master_experience mex
                WHERE mex.mex_userId = ?
                AND mex.mex_status = 'ACTIVE'`, [userId]);

            const totalXP = userStats[0]?.total_xp || 0;

            // FIND UNLOCKABLE ACHIEVEMENTS
            const achievementsRaw = await mysql.Query(`
                SELECT mac.* FROM master_achievement mac
                WHERE mac.mac_status = 'ACTIVE'
                AND mac.mac_requiredExperience <= ?
                AND mac.mac_id NOT IN (
                SELECT mua.mua_achievementId
                FROM master_user_achievement mua
                WHERE mua.mua_userId = ?
                AND mua.mua_status = 'ACTIVE')
                ORDER BY mac.mac_requiredExperience`, [totalXP, userId]);

            const achievements = Array.isArray(achievementsRaw) ? achievementsRaw : [];
            console.log(`User ${userId}: ${totalXP}XP, ${achievements.length} achievements found`);

            // AUTOMATION
            for (const ach of achievements) {
                try {

                    // RECORD ACHIEVEMENT UNLOCK
                    await mysql.Query(`
                        INSERT INTO master_user_achievement
                            (mua_userId,
                            mua_achievementId,
                            mua_pointsAwarded,
                            mua_experienceAwarded)
                        VALUES (?, ?, ?, ?)`, [userId, ach.mac_id, ach.mac_pointsAwarded, ach.mac_experienceAwarded]);

                    // AWARD POINTS
                    await mysql.Query(`
                        INSERT INTO master_reward_point
                            (mrp_userId,
                            mrp_pointsAdded,
                            mrp_source)
                        VALUES (?, ?, ?)`, [userId, ach.mac_pointsAwarded, `ACHIEVEMENT: ${ach.mac_name}`]);

                    // AWARD EXP
                    await mysql.Query(`
                        INSERT INTO master_experience
                            (mex_userId,
                            mex_achievementId,
                            mex_experiencePoints,
                            mex_totalExperience)
                        VALUES (?, ?, ?, ?)`, [userId, ach.mac_id, ach.mac_experienceAwarded,
                        totalXP + ach.mac_experienceAwarded]);

                    awarded.push({
                        name: ach.mac_name,
                        points: ach.mac_pointsAwarded,
                        exp: ach.mac_experienceAwarded
                    });

                    console.log(`Awarded ${ach.mac_name} to User ${userId}`);

                } catch (err) {
                    console.error(`Failed to award ${ach.mac_name}:`, err);
                    continue;
                }
            }
            // SYSTEM LOGGING - SUCCESS
            await SystemLogger.logAction(
                req.user.id,
                req.ip,
                req.get("User-Agent"),
                "ACHIEVEMENTS_AUTO_AWARDED",
                "master_user_achievement",
                null,
                null,
                JSON.stringify({
                    awardedCount: awarded.length,
                    achievements: awarded 
                })
            );

        res.status(200).json({
            message: "Achievements checked & awarded",
            newlyUnlocked: awarded,
            totalXP: totalXP,
            unlockedCount: awarded.length
        });

        } catch (error) {
            // SYSTEM LOGGING - ERROR
            if (req.user?.id) {
                await SystemLogger.logAction(
                    req.user.id,
                    req.ip,
                    req.get("User-Agent"),
                    "ACHIEVEMENTS_CHECK_FAILED",
                    "master_user_achievement",
                    null,
                    null,
                    null,
                    "FAILED",
                    error.message
                );
            }
            console.error("AchievementsController.checkAchievements: ", error);
            res.status(500).json({
                message: "Server error (500)"
            });
        }
    }
}

module.exports = AchievementsController;