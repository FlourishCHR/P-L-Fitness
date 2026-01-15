const mysql = require('../services/dbconnect.js');
const SystemLogger = require('../services/systemLogger.js');
const bcryptjs = require('bcryptjs');

class AdminController {
    // GET /admin/ DASHBOARD PAGE
    static getDashboard(req, res) {
        res.render("admin", {title: "Admin"});
    }


    // POST /admin/seed-admin
    static async seedAdmin(req, res) {
        try {
            
            if (process.env.NODE_ENV === 'production') {
                return res.status(403).json({
                    message: "Seed disabled in production"
                });
            }

            const password = await bcryptjs.hash('admin123', 10);

            await mysql.Query(`
                INSERT IGNORE INTO master_user
                    (mu_username,
                    mu_password,
                    mu_firstName,
                    mu_lastName,
                    mu_role,
                    mu_status)
                VALUES (?, ?, 'Admin', 'USER', 'ADMIN', 'ACTIVE')
                `, ["admin", password]);

                // SYSTEM LOGGING - SUCCESS
                await SystemLogger.logAction(
                    null,
                    req.id || "127.0.0.1",
                    req.get("User-Agent") || "seed-script",
                    "ADMIN-SEEDED",
                    "master_user",
                    null, // no record ID
                    null, // no old data
                    { username: "admin", password: "admin123" }
                )

                res.status(200).json({
                    message: "Admin created: admin/admin123"
                });

        } catch (error) {
            console.error("AdminController.seedAdmin: ", error);
            res.status(500).json({
                message: "Server Error (500)",
                data: error
            });
        }
    }


    // GET /admin/load
    static async loadUsers(req,res) {
        try {
            
            if (!req.user?.id || req.user.role !== "ADMIN") {
                return res.status(401).json({
                    message: "Admin authentication required (Bearer token)"
                });
            }

            const sql =`
            SELECT
                mu.mu_id,
                mu.mu_email,
                mu.mu_username,
                mu.mu_firstName,
                mu.mu_lastName,
                mu.mu_phoneNumber,
                mu.mu_role,
                mu.mu_specialty,
                mu.mu_status,
                mu.mu_createdAt,
                mu.mu_updatedAt,

                c.mu_firstName AS createdByName,
                u.mu_firstName AS updatedByName,
                d.mu_firstName AS deletedByName

            FROM master_user mu
            LEFT JOIN master_user c ON mu.mu_createdById = c.mu_id
            LEFT JOIN master_user u ON mu.mu_updatedById = u.mu_id
            LEFT JOIN master_user d ON mu.mu_deletedById = d.mu_id
            -- WHERE mu.mu_status != 'DELETED' -- delete this comment to see DELETED status
            ORDER BY mu.mu_createdAt DESC
            `;

            const result = await mysql.Query(sql);

            // SYSTEM LOGGING - SUCCESS
            await SystemLogger.logAction(
                req.user.id,
                req.ip,
                req.get("User-Agent"),
                "USERS_LISTED",
                "master_user",
                null, // no specific record
                null, // no old data
                null, // no new data
            );

            res.status(200).json({
                message: "Success",
                data: result
            });

        } catch (error) {
            console.error("AdminController.loadUsers: ", error);
            res.status(500).json({
                message: "Error fetching users",
                data: error
            });
        }
    }


    // POST /admin/insert
    static async createUser(req, res) {
        try {
            
            if (!req.user?.id || req.user.role !== "ADMIN") {
                return res.status(401).json({
                    message: "Admin authentication required (Bearer token)"
                });
            }

            const { email, username, password,
                firstName, lastName, phoneNumber,
                role, specialty, status
            } = req.body;

            // PASSWORD VALIDATION
            if (!password || typeof password !== "string" || password.trim().length < 8) {
                return res.status(400).json({
                    message: "Password required and must be at least 8 characters"
                });
            }

            // PASSWORD HASHING
            const hashedPassword = await bcryptjs.hash(password.trim(), 12)

            // CHECK UNIQUE EMAIL
            const emailSqlExist =`
            SELECT 1 FROM master_user
            WHERE mu_email = ?`;
            let emailSqlResult = await mysql.Query(emailSqlExist, [email]);
            if (emailSqlResult.length > 0) {
                return res.status(409).json({
                    message: "Email already exists"
                });
            }

            // CHECK UNIQUE USERNAME
            const usernameSqlExist =`
            SELECT 1 FROM master_user
            WHERE mu_username = ?`;
            let usernameSqlResult = await mysql.Query(usernameSqlExist, [username]);
            if (usernameSqlResult.length > 0) {
                return res.status(409).json({
                    message: "Username already exist"
                });
            }

            const sql =`
            INSERT INTO master_user
                (mu_email,
                mu_username,
                mu_password,
                mu_firstName,
                mu_lastName,
                mu_phoneNumber,
                mu_role,
                mu_specialty,
                mu_status,
                mu_createdById)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            const result = await mysql.Query(sql, [email, username,
                hashedPassword, firstName, lastName, phoneNumber, role,
                specialty, status, req.user.id
            ]);

            // SYSTEM LOGGING - SUCCESS
            await SystemLogger.logAction(
                req.user.id,
                req.ip,
                req.get("User-Agent"),
                "USER_CREATED",
                "master_user",
                result.insertId, // New userId
                null, // no old data
                {
                    username,
                    email,
                    role,
                    createdBy: req.user.id
                }
            );

            res.status(201).json({
                message: "User created successfully",
                userId: result.insertId,
                data: result
            });

        } catch (error) {
            if (error.code === "ER_DUP_ENTRY") {
                return res.status(409).json({
                    message: "Duplicated Email or Username",
                    data: error
                });
            }
            console.error("AdminController.createUser: ", error);
            res.status(500).json({
                message: "Server Error (500)",
                data: error
            });
        }
    }


    // PUT /admin/update
    static async updateUser(req, res) {
        try {
            
            if (!req.user?.id || req.user.role !== "ADMIN") {
                return res.status(401).json({
                    message: "Admin authentication required (Bearer token)"
                });
            }

            const { id, email, username, password,
                firstName, lastName, phoneNumber,
                role, specialty, status
             } = req.body;

            // ID VALIDATION
            if (!id || isNaN(id)) {
                return res.status(400).json({
                    message: "Valid ID required"
                });
            }

            // PASSWORD VALIDATION
            let hashedPassword;
            if (password && password.trim().length >= 8) {
                hashedPassword = await bcryptjs.hash(password.trim(), 12);
            } else {
                const user = await mysql.Query(`SELECT mu_password FROM master_user WHERE mu_id = ?`, [id]);
                if (!user.length) return res.status(404).json({ message: "User not found" });
                hashedPassword = user[0].mu_password;
            }

            // CHECK UNIQUE EMAIL
            const emailSqlExist =`
            SELECT 1 FROM master_user
            WHERE mu_email = ?
            AND mu_id != ?`;
            let emailSqlResult = await mysql.Query(emailSqlExist, [email, id]);
            if (emailSqlResult.length > 0) {
                return res.status(409).json({
                    message: "Email already exist"
                });
            }

            // CHECK UNIQUE USERNAME
            const usernameSqlExist =`
            SELECT 1 FROM master_user
            WHERE mu_username = ?
            AND mu_id != ?`;
            let usernameSqlResult = await mysql.Query(usernameSqlExist, [username, id]);
            if (usernameSqlResult.length > 0) {
                return res.status(409).json({
                    message: "Username already exist"
                });
            }

             // OLD USER SYSTEM LOGGING
            const oldUser = await mysql.Query(`
                SELECT
                    mu_username,
                    mu_email,
                    mu_role
                FROM master_user
                WHERE mu_id = ?`, [id]);

            const sql =`
            UPDATE master_user
            SET
                mu_email = ?,
                mu_username = ?,
                mu_password = ?,
                mu_firstName = ?,
                mu_lastName = ?,
                mu_phoneNumber = ?,
                mu_role = ?,
                mu_specialty = ?,
                mu_status = ?,
                mu_deletedById = NULL,
                mu_updatedById = ?
            WHERE mu_id = ?`;

            const result = await mysql.Query(sql, [email, username, hashedPassword,
                firstName, lastName, phoneNumber, role, specialty, status, req.user.id, id
            ]);

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
                "USER_UPDATED",
                "master_user",
                id,
                oldUser[0] || null, // old data
                {
                    username,
                    email,
                    role
                } // new data
            );

            res.status(200).json({
                message: "User updated successfully",
                affectedRows: result.affectedRows,
                data: result
            });

        } catch (error) {
            if (error.code === "ER_DUP_ENTRY") {
                return res.status(409).json({
                    message: "Duplicated Email or Username"
                });
            }
            console.error("AdminController.updateUser: ", error);
            res.status(500).json({
                message: "Server Error (500)",
                data: error
            });
        }
    }


    // PUT /admin/delete
    static async deleteUser(req, res) {
        try {
            
            if (!req.user?.id || req.user.role !== "ADMIN") {
                return res.status(401).json({
                    message: "Admin authentication required (Bearer token)"
                });
            }

            const { id } = req.body;

            // ID VALIDATION
            if (!id || isNaN(id)) {
                return res.status(400).json({
                    message: "Valid ID required"
                });
            }

            // OLD USER SYSTEM LOGGING
            const oldUser = await mysql.Query(`
            SELECT
                mu_username,
                mu_email,
                mu_role
            FROM master_user
            WHERE mu_id = ?`, [id]);

            const sql =`
            UPDATE master_user
            SET
                mu_email = CONCAT('DELETED_', mu_id, '@deleted.com'),
                mu_username = CONCAT('DELETED_', mu_id),
                mu_password = 'DELETED',
                mu_firstName = 'DELETED',
                mu_lastName = 'DELETED',
                mu_phoneNumber = 'DELETED',
                mu_role = 'DELETED',
                mu_specialty = 'DELETED',
                mu_status = 'DELETED',
                mu_deletedById = ?,
                mu_deletedAt = NOW()
            WHERE mu_id = ?`;

            const result = await mysql.Query(sql, [req.user.id, id]);

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
                "USER_DELETED",
                "master_user",
                id,
                oldUser[0] || null, // old data
                {
                    deletedBy: req.user.id
                }
            );

            res.status(200).json({
                message: "User has been soft deleted",
                affectedRows: result.affectedRows
            });

        } catch (error) {
            console.error("AdminController.deleteUser: ", error);
            res.status(500).json({
                message: "Server Error (500)"
            });
        }
    }
}

module.exports = AdminController;