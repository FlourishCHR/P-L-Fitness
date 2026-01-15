const mysql = require('../services/dbconnect.js');
const SystemLogger = require('../services/systemLogger.js');

class SessionsController {
    // GET /sessions/ - DASHBOARD PAGE
    static getDashboard(req, res) {
        res.render("sessions", {title: "Sessions"});
    }


    // GET /sessions/load
    static async loadSessions(req, res) {
        try {

            if(!req.user?.id) {
                return res.status(401).json({
                    message: "Authentication required (Bearer token)"
                });
            }

            if (req.user.role !== "ADMIN" && req.user.role !== "COACH") {
                return res.status(401).json({
                    message: "Admin or Coach access required"
                });
            }
            
            const sql =`
            SELECT
                ms.ms_id,
                ms.ms_userId,
                CONCAT(mu.mu_firstName, ' ', mu.mu_lastName) as coachName,
                ms.ms_sessionName,
                ms.ms_datetime,
                ms.ms_capacity,
                ms.ms_status
            FROM master_session ms
            LEFT JOIN master_user mu ON ms.ms_userId = mu.mu_id
            -- WHERE mu.mu_status != 'DELETED' -- delete this to see 'DELETED' status
            ORDER BY ms.ms_datetime ASC`;

            const result = await mysql.Query(sql);

            // SYSTEM LOGGING - SUCCESS
            await SystemLogger.logAction(
                req.user.id,
                req.ip,
                req.get("User-Agent"),
                "SESSIONS_LISTED",
                "master_session",
                null,
                null,
                JSON.stringify({
                    totalSessions: result.length
                })
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
                    "SESSIONS_LIST_FAILED",
                    "master_session",
                    null,
                    null,
                    null,
                    "FAILED",
                    error.message
                );
            }
            console.error("SessionsController.loadSessions: ", error);
            res.status(500).json({
                message: "Error fetching sessions",
                data: error
            });
        }
    }


    // POST /sessions/insert
    static async createSession(req, res) {
        try {
            
            if (!req.user?.id) {
                return res.status(401).json({
                    message: "Authentication required (Bearer token)"
                });
            }

            if (req.user.role !== "ADMIN" && req.user.role !== "COACH") {
                return res.status(401).json({
                    message: "Admin or Coach access required"
                });
            }

            const { userId, sessionName, datetime, capacity } = req.body;

            // VALIDATION
            if (!userId || !sessionName || !datetime || !capacity) {
                return res.status(400).json({
                    message: "userId, sessionName, datetime, capacity required"
                });
            }

            const sql =`
            INSERT INTO master_session
                (ms_userId,
                ms_sessionName,
                ms_datetime,
                ms_capacity,
                ms_status)
            VALUES (?, ?, ?, ?, 'ACTIVE')`;

            const result = await mysql.Query(sql, [userId, sessionName, datetime, capacity]);

            //SYSTEM LOGGING - SUCCESS
            await SystemLogger.logAction(
                req.user.id,
                req.ip,
                req.get("User-Agent"),
                "SESSION_CREATED",
                "master_session",
                result.insertId,
                null,
                JSON.stringify({
                    userId,
                    sessionName,
                    datetime,
                    capacity,
                    ms_id: result.insertId
                })
            );

            res.status(201).json({
                message: "Session created successfully",
                data: {
                    ms_id: result.insertId
                }
            });

        } catch (error) {
            // SYSTEM LOGGING - ERROR
            if(req.user?.id) {
                await SystemLogger.logAction(
                    req.user.id,
                    req.ip,
                    req.get("User-Agent"),
                    "SESSION_CREATE_FAILED",
                    "master_session",
                    null,
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
            console.error("SessionsController.createSession: ", error);
            res.status(500).json({
                message: "Server Error (500)",
                data: error
            });
        }
    }


    // PUT /sessions/update
    static async updateSession(req, res) {
        try {
            
            if (!req.user?.id) {
                return res.status(401).json({
                    message: "Authentication required (Bearer token)"
                });
            }

            if (req.user.role !== "ADMIN" && req.user.role !== "COACH") {
                return res.status(401).json({
                    message: "Admin or Coach access required"
                });
            }

            const { id, sessionName, datetime, capacity, status } = req.body;

            // VALIDATION
            if (!id || !sessionName || !datetime || !capacity) {
                return res.status(400).json({
                    message: "id, sessionName, datetime, capacity required"
                });
            }

            const sql =`
            UPDATE master_session
            SET
                ms_sessionName = ?,
                ms_datetime = ?,
                ms_capacity = ?,
                ms_status = COALESCE(?, ms_status)
            WHERE ms_id = ?`;

            const result = await mysql.Query(sql, [sessionName, datetime, capacity, status, id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Session not found"
                });
            }

            // SYSTEM LOGGING - SUCCESS
            await SystemLogger.logAction(
                req.user.id,
                req.ip,
                req.get("User-Agent"),
                "SESSION_UPDATED",
                "master_session",
                id,
                null,
                JSON.stringify({
                    id,
                    sessionName,
                    datetime,
                    capacity,
                    status: status || "unchanged",
                    affectedRows: result.affectedRows
                })
            );

            res.status(200).json({
                message: "Session has been updated",
                affectedRows: result.affectedRows,
                data: result
            });

        } catch (error) {
            // SYSTEM LOGGING - ERROR
            if(req.user?.id) {
                await SystemLogger.logAction(
                    req.user.id,
                    req.ip,
                    req.get("User-Agent"),
                    "SESSION_UPDATE_FAILED",
                    "master_session",
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
            console.error("SessionsController.updateSession: ", error);
            res.status(500).json({
                message: "Server Error (500)",
                data: error
            });
        }
    }


    // PUT /sessions/delete
    static async deleteSession(req, res) {
        try {
            
            if (!req.user?.id) {
                return res.status(401).json({
                    message: "Authentication required (Bearer token)"
                });
            }

            if (req.user.role !== "ADMIN" && req.user.role !== "COACH") {
                return res.status(401).json({
                    message: "Admin or Coach access required"
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
            UPDATE master_session
            SET ms_status = 'CANCELLED'
            WHERE ms_id = ?`;

            const result = await mysql.Query(sql, [id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Session not found"
                });
            }

            // SYSTEM LOGGING - SUCCESS
            await SystemLogger.logAction(
                req.user.id,
                req.ip,
                req.get("User-Agent"),
                "SESSION CANCELLED",
                "master_session",
                id,
                null,
                JSON.stringify({
                    id,
                    affectedRows: result.affectedRows
                })
            );

            res.status(200).json({
                message: "Session has been soft deleted",
                affectedRows: result.affectedRows,
                data: result
            });

        } catch (error) {
            // SYSTEM LOGGING - ERROR
            if(req.user?.id) {
                await SystemLogger.logAction(
                    req.user.id,
                    req.ip,
                    req.get("User-Agent"),
                    "SESSION_DELETE_FAILED",
                    "master_session",
                    id,
                    null,
                    null,
                    "FAILED",
                    error.message
                );
            }
            console.error("SessionsController.deleteSession: ", error);
            res.status(500).json({
                message: "Server Error (500)",
                data: error
            });
        }
    }
}

module.exports = SessionsController;