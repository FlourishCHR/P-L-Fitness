const mysql = require('../services/dbconnect.js');
const SystemLogger = require('../services/systemLogger.js');

class ExperienceController {
    // GET /experience/:userId -> Current EXP + Rank
    static async getUserExperience(req, res) {
        try {

            if (!req.user?.id) {
                return res.status(401).json({
                    message: "Authentication required (Bearer token)"
                });
            }

            // MEMBERSHIP CHECKING
            const membership = await mysql.Query(`
                SELECT mm_planType
                FROM master_membership
                WHERE mm_userId = ?
                AND mm_status = "ACTIVE"
                LIMIT 1`, [req.user.id]);

            if (membership[0]?.mm_planType !== "PREMIUM") {
                return res.status(403).json({
                    message: "PREMIUM membership required to view experience"
                });
            }

            const userId = req.params.userId || req.user.id;

            const sql =`
            SELECT 
                user_id,
                total_xp,
                COALESCE(r.mr_name, 'BRONZE') as current_rank,
                r.mr_icon
            FROM (
                SELECT u.mu_id as user_id,
                COALESCE(SUM(mex.mex_experiencePoints), 0) AS total_xp
                FROM master_user u
                LEFT JOIN master_experience mex ON u.mu_id = mex.mex_userId 
                AND mex.mex_status = 'ACTIVE'
                WHERE u.mu_id = ?
                GROUP BY u.mu_id
            ) user_xp
            LEFT JOIN master_rank r ON user_xp.total_xp BETWEEN r.mr_minExperience 
            AND COALESCE(r.mr_maxExperience, 999999)
            AND r.mr_status = 'ACTIVE'
            ORDER BY r.mr_sortOrder DESC LIMIT 1`;

            const defaultRank = await mysql.Query(`
            SELECT 
                COALESCE(mus.mus_totalExperience, 0) AS total_xp,
                COALESCE(r.mr_name, 'BRONZE') AS current_rank,
                r.mr_icon
            FROM master_user_stats mus
            LEFT JOIN master_rank r ON mus.mus_currentRankId = r.mr_id
            WHERE mus.mus_userId = ?`, [userId]);

            const result = await mysql.Query(sql, [userId]);

            // SYSTEM LOGGING - SUCCESS
            await SystemLogger.logAction(
                req.user.id,
                req.ip,
                req.get("User-Agent"),
                "USER_EXPERIENCE_LOADED",
                "master_experience",
                null
            );

            res.status(200).json({
                message: "Success",
                data: result[0] || {
                    user_id: userId,
                    total_xp: defaultRank[0]?.total_xp || 0,
                    current_rank: defaultRank[0]?.current_rank || "BRONZE",
                    mr_icon: defaultRank[0]?.mr_icon || null
                }
            })

        } catch (error) {
            // SYSTEM LOGGING - ERROR
            if (req.user?.id) {
                await SystemLogger.logAction(
                    req.user.id,
                    req.ip,
                    req.get("User-Agent"),
                    "EXP_GET_FAILED",
                    "master_experience",
                    null,
                    null,
                    null,
                    "FAILED",
                    error.message
                );
            }
            console.error("ExperienceController.getUserExperience: ", error);
            res.status(500).json({
                message: "Error loading experience"
            });
        }
    }


    // POST /experience/add -> +EXP from attendance/session
    static async addExperience(req, res) {
        try {
            
            if(!req.user?.id || req.user.role !== "ADMIN") {
                return res.status(401).json({
                    message: "Admin required (Bearer token)"
                });
            }

            const { userId, experiencePoints, totalExperience } = req.body;

            // VALIDATION
            if(!userId || !experiencePoints || !totalExperience) {
                return res.status(400).json({
                    message: "userId, experiencePoints, totalExperience required"
                });
            }

            const sql =`
            INSERT INTO master_experience
                (mex_userId,
                mex_experiencePoints,
                mex_totalExperience,
                mex_status)
            VALUES(?, ?, ?, "ACTIVE")`;

            const result = await mysql.Query(sql, [userId, parseInt(experiencePoints), totalExperience]);

            // SYSTEM LOGGING - SUCCESS
            await SystemLogger.logAction(
                req.user.id,
                req.ip,
                req.get("User-Agent"),
                "EXP_ADDED",
                "master_experience",
                result.insertId,
                null,
                JSON.stringify({
                    userId,
                    experiencePoints: parseInt(experiencePoints),
                    totalExperience
                })
            );

            res.status(201).json({
                message: "Experience added successfully",
                data: {
                    id: result.insertId,
                    userId,
                    experiencePoints: parseInt(experiencePoints),
                    totalExperience
                }
            });

        } catch (error) {
            // SYSTEM LOGGING - ERROR
            if (req.user?.id) {
                await SystemLogger.logAction(
                    req.user.id,
                    req.ip,
                    req.get("User-Agent"),
                    "EXP_ADD_FAILED",
                    "master_experience",
                    null,
                    null,
                    null,
                    "FAILED",
                    error.message
                );
            }
            console.error("ExperienceController.addExperience: ", error);
            res.status(500).json({
                message: "Server Error (500)"
            });
        }
    }


    // GET /experience/leaderboard -> top 10
    static async getLeaderboards(req, res) {
        try {
            
            if (!req.user?.id) {
                return res.status(401).json({
                    message: "Authentication required (Bearer token)"
                });
            }

            // MEMBERSHIP CHECK
            const membership = await mysql.Query(`
                SELECT mm_planType
                FROM master_membership
                WHERE mm_userId = ?
                AND mm_status = "ACTIVE"
                LIMIT 1`, [req.user.id]);
            
            if (membership[0]?.mm_planType !== "PREMIUM") {
                return res.status(403).json({
                    message: "PREMIUM membership required to view leaderboards"
                });
            }

            const sql =`
            SELECT 
                user_id,
                total_xp,
                COALESCE(r.mr_name, 'BRONZE') as current_rank,
                r.mr_icon
            FROM (
                SELECT u.mu_id as user_id,
                COALESCE(SUM(mex.mex_experiencePoints), 0) AS total_xp
                FROM master_user u
                LEFT JOIN master_experience mex ON u.mu_id = mex.mex_userId
                AND mex.mex_status = 'ACTIVE'
                WHERE u.mu_status = 'ACTIVE'
                GROUP BY u.mu_id
            ) user_xp
            LEFT JOIN master_rank r ON user_xp.total_xp BETWEEN r.mr_minExperience
            AND COALESCE(r.mr_maxExperience, 999999)
            AND r.mr_status = 'ACTIVE'
            ORDER BY r.mr_sortOrder DESC, total_xp DESC LIMIT 10`;

            const result = await mysql.Query(sql);

            // SYSTEM LOGGING - SUCCESS
            await SystemLogger.logAction(
                req.user.id,
                req.ip,
                req.get("User-Agent"),
                "LEADERBOARD_LOADED",
                "master_experience",
                null,
                null,
                JSON.stringify({
                    userId: req.user.id,
                    membership: "PREMIUM",
                    leaderboardCount: result.length
                })
            );

            res.status(200).json({
                message: "Leaderboard",
                data: result
            });

        } catch (error) {
            // SYSTEM LOGGING - ERROR
            if (req.user?.id) {
                await SystemLogger.logAction(
                    req.user.id,
                    req.ip,
                    req.get("User-Agent"),
                    "LEADERBOARD_FAILED",
                    "master_experience",
                    null,
                    null,
                    null,
                    "FAILED",
                    error.message
                );
            }
            console.error("ExperienceController.getLeaderboard: ", error);
            res.status(500).json({
                message: "Error fetching leaderboards"
            })
        }
    }
}

module.exports = ExperienceController;