const mysql = require('../services/dbconnect.js');
const SystemLogger = require('../services/systemLogger.js');

class RankController {
    // GET /ranks/ DASHBOARD PAGE
    static getDashboard(req, res) {
        res.render("ranks", {title: "Member ranks"});
    }

    
    // GET /ranks/load
    static async loadRanks(req, res) {
        try {
            
            if (!req.user?.id) {
                return res.status(401).json({
                    message: "Authentication required (Bearer token)"
                });
            }

            const sql =`
            SELECT * FROM master_rank
            ORDER BY mr_sortOrder ASC`;

            const result = await mysql.Query(sql);

            // SYSTEM LOGGING - SUCCESS
            await SystemLogger.logAction(
                req.user.id,
                req.ip,
                req.get("User-Agent"),
                "RANKS_LISTED",
                "master_rank",
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
                    "RANK_LIST_FAILED",
                    "master_rank",
                    null,
                    null,
                    null,
                    "FAILED",
                    error.message
                );
            }
            console.error("RankController.loadRanks: ", error);
            res.status(500).json({
                message: "Error fetching ranks",
                data: error
            });
        }
    }


    // POST /ranks/insert
    static async createRank(req, res) {
        try {
            
            if (!req.user?.id || req.user.role !== "ADMIN") {
                return res.status(401).json({
                    message: "Admin authentication required (Bearer token)"
                });
            }

            const { name, description, minExperience, maxExperience, icon, sortOrder, status } = req.body;

            // VALIDATION
            if(!name || minExperience === undefined || sortOrder === undefined) {
                return res.status(400).json({
                    message: "name, minExperience, sortOrder required",
                    validStatus: ["ACTIVE", "INACTIVE"]
                });
            }

            const sql =`
            INSERT INTO master_rank
                (mr_name,
                mr_description,
                mr_minExperience,
                mr_maxExperience,
                mr_icon,
                mr_sortOrder,
                mr_status)
            VALUES (?, ?, ?, ?, ?, ?, ?)`;

            const result = await mysql.Query(sql, [name, description || null, 
                parseInt(minExperience), maxExperience ? parseInt(maxExperience) : null,
                icon || null, parseInt(sortOrder), status || "ACTIVE"]);

            // SYSTEM LOGGING - SUCCESS
            await SystemLogger.logAction(
                req.user.id,
                req.ip,
                req.get("User-Agent"),
                "RANK_CREATED",
                "master_rank",
                result.insertId,
                null,
                JSON.stringify({
                    name,
                    minExperience: parseInt(minExperience),
                    maxExperience,
                    sortOrder: parseInt(sortOrder)
                })
            );

            res.status(201).json({
                message: "Rank created successfully",
                data: {
                    id: result.insertId,
                    name,
                    minExperience: parseInt(minExperience),
                    maxExperience,
                    sortOrder: parseInt(sortOrder)
                }
            });

        } catch (error) {
            // SYSTEM LOGGING - ERROR
            if (req.user?.id) {
                await SystemLogger.logAction(
                    req.user.id,
                    req.ip,
                    req.get("User-Agent"),
                    "RANK_CREATE_FAILED",
                    "master_rank",
                    null,
                    null,
                    null,
                    "FAILED",
                    error.message
                );
            }
            if (error.code === "ER_DUP_ENTRY") {
                return res.status(409).json({
                    message: "Duplicate rank name",
                    data: error
                });
            }
            console.error("RankController.createRank: ", error);
            res.status(500).json({
                message: "Server Error (500)",
                data: error
            });
        }
    }


    // PUT /ranks/update
    static async updateRank(req, res) {
        try {
            
            if (!req.user?.id || req.user.role !== "ADMIN") {
                return res.status(401).json({
                    message: "Admin authentication required (Bearer token)"
                });
            }

            const { id, name, description, minExperience, maxExperience, icon, sortOrder, status } = req.body;

            // VALIDATION
            if (!id || !name || minExperience === undefined || sortOrder === undefined) {
                return res.status(400).json({
                    message: "id, name, minExperience, sortOrder required"
                });
            }

            const sql =`
            UPDATE master_rank
            SET
                mr_name = ?,
                mr_description = ?,
                mr_minExperience = ?,
                mr_maxExperience = ?,
                mr_icon = ?,
                mr_sortOrder = ?,
                mr_status = ?
            WHERE mr_id = ?`;

            const result = await mysql.Query(sql, [name, description || null,
                parseInt(minExperience), maxExperience ? parseInt(maxExperience) : null,
                icon || null, parseInt(sortOrder), status || "ACTIVE", id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Rank not found"
                });
            }

            // SYSTEM LOGGING - SUCCESS
            await SystemLogger.logAction(
                req.user.id,
                req.ip,
                req.get("User-Agent"),
                "RANK_UPDATED",
                "master_rank",
                id
            );

            res.status(200).json({
                message: "Rank updated successfully",
                affectedRows: result.affectedRows
            });

        } catch (error) {
            // SYSTEM LOGGING - ERROR
            if (req.user?.id) {
                await SystemLogger.logAction(
                    req.user.id,
                    req.ip,
                    req.get("User-Agent"),
                    "RANK_UPDATE_FAILED",
                    "master_rank",
                    null,
                    null,
                    null,
                    "FAILED",
                    error.message
                );
            }
            if (error.code === "ER_DUP_ENTRY") {
                return res.status(409).json({
                    message: "Duplicate rank name",
                    data: error
                });
            }
            console.error("RankController.updateRank: ", error);
            res.status(500).json({
                message: "Server Error (500)",
                data: error
            });
        }
    }


    // PUT /ranks/delete
    static async deleteRank(req, res) {
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
            UPDATE master_rank
            SET mr_status = 'INACTIVE'
            WHERE mr_id = ?`;

            const result = await mysql.Query(sql, [id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Rank not found"
                });
            }

            // SYSTEM LOGGING - SUCCESS
            await SystemLogger.logAction(
                req.user.id,
                req.ip,
                req.get("User-Agent"),
                "RANK_DELETED",
                "master_rank",
                id,
                null,
                JSON.stringify({
                    id
                })
            );

            res.status(200).json({
                message: "Rank has been soft-deleted",
                affectedRows: result.affectedRows
            });

        } catch (error) {
            // SYSTEM LOGGING - ERROR
            if (req.user?.id) {
                await SystemLogger.logAction(
                    req.user.id,
                    req.ip,
                    req.get("User-Agent"),
                    "RANK_DELETE_FAILED",
                    "master_rank",
                    id,
                    null,
                    null,
                    "FAILED",
                    error.message
                );
            }
            console.error("RankController.deleteRank: ", error);
            res.status(500).json({
                message: "Server Error (500)",
                data: error
            });
        }
    }
}


module.exports = RankController;