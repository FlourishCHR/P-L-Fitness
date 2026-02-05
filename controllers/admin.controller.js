const mysql = require('../services/dbconnect.js');
const SystemLogger = require('../services/systemLogger.js');
const bcryptjs = require('bcryptjs');

class AdminController {
    // GET /admin/ DASHBOARD PAGE
    static getDashboard(req, res) {
        res.render("admin", {title: "Admin"});
    }


    // GET /admin/dashboard-analytics
    static async getDashboardAnalytics(req, res) {
        try {
            if (!req.user?.id || req.user.role !== "ADMIN") {
                return res.status(401).json({
                    message: "Admin authentication required"
                });
            }

            // Initialize with defaults
            let totalMembers = 0, newThisMonth = 0, memberGrowth = 0;
            let monthlyRevenue = 0, revenueGrowth = 0;
            let activeToday = 0, totalSessions = 0, activeSessions = 0;
            let statusBreakdown = [], roleBreakdown = [];
            let revenueTrend = [], weeklyAttendance = [], recentActivity = [];

            // Total members count
            try {
                const totalMembersResult = await mysql.Query(`
                    SELECT COUNT(*) as count
                    FROM master_user
                    WHERE mu_status != 'DELETED'`);
                totalMembers = totalMembersResult[0]?.count || 0;
            } catch (e) { console.error("Query error - totalMembers:", e.message); }

            // New members this month
            try {
                const newThisMonthResult = await mysql.Query(`
                    SELECT COUNT(*) as count
                    FROM master_user
                    WHERE mu_status != 'DELETED'
                    AND MONTH(mu_createdAt) = MONTH(CURRENT_DATE())
                    AND YEAR(mu_createdAt) = YEAR(CURRENT_DATE())`);
                newThisMonth = newThisMonthResult[0]?.count || 0;

                const lastMonthResult = await mysql.Query(`
                    SELECT COUNT(*) as count FROM master_user
                    WHERE mu_status != 'DELETED'
                    AND mu_createdAt < DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01')`);
                const lastMonthTotal = lastMonthResult[0]?.count || 1;
                memberGrowth = lastMonthTotal > 0 ? Math.round((newThisMonth / lastMonthTotal) * 100) : 0;
            } catch (e) { console.error("Query error - memberGrowth:", e.message); }

            // Monthly revenue - use mp_createdAt if mp_paymentDate doesn't exist
            try {
                const revenueResult = await mysql.Query(`
                    SELECT COALESCE(SUM(mp_finalAmount), 0) as revenue
                    FROM master_payment
                    WHERE mp_status = 'PAID'`);
                monthlyRevenue = revenueResult[0]?.revenue || 0;
            } catch (e) { console.error("Query error - monthlyRevenue:", e.message); }

            // Active today (check-ins today)
            try {
                const activeTodayResult = await mysql.Query(`
                    SELECT COUNT(DISTINCT ma_userId) as count
                    FROM master_attendance
                    WHERE DATE(ma_checkin) = CURRENT_DATE()
                    AND ma_deleted = 0`);
                activeToday = activeTodayResult[0]?.count || 0;
            } catch (e) { console.error("Query error - activeToday:", e.message); }

            // Total sessions
            try {
                const totalSessionsResult = await mysql.Query(`
                    SELECT COUNT(*) as count
                    FROM master_session`);
                totalSessions = totalSessionsResult[0]?.count || 0;

                const activeSessionsResult = await mysql.Query(`
                    SELECT COUNT(*) as count
                    FROM master_session
                    WHERE ms_status = 'ACTIVE'`);
                activeSessions = activeSessionsResult[0]?.count || 0;
            } catch (e) { console.error("Query error - sessions:", e.message); }

            // Status breakdown
            try {
                statusBreakdown = await mysql.Query(`
                    SELECT
                        mu_status as status,
                        COUNT(*) as count
                    FROM master_user
                    WHERE mu_status != 'DELETED'
                    GROUP BY mu_status`);
            } catch (e) { console.error("Query error - statusBreakdown:", e.message); }

            // Role breakdown
            try {
                roleBreakdown = await mysql.Query(`
                    SELECT mu_role as role, COUNT(*) as count
                    FROM master_user
                    WHERE mu_status != 'DELETED'
                    GROUP BY mu_role`);
            } catch (e) { console.error("Query error - roleBreakdown:", e.message); }

            // Revenue trend - simplified
            try {
                revenueTrend = await mysql.Query(`
                    SELECT
                        'Current' as month,
                        COALESCE(SUM(mp_finalAmount), 0) as revenue,
                        COUNT(*) as members
                    FROM master_payment
                    WHERE mp_status = 'PAID'`);
            } catch (e) { console.error("Query error - revenueTrend:", e.message); }

            // Weekly attendance
            try {
                weeklyAttendance = await mysql.Query(`
                    SELECT
                        DATE_FORMAT(ma_checkin, '%a') as day,
                        COUNT(*) as attendance
                    FROM master_attendance
                    WHERE ma_checkin >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
                    AND ma_deleted = 0
                    GROUP BY DATE(ma_checkin)
                    ORDER BY DATE(ma_checkin) ASC`);
            } catch (e) { console.error("Query error - weeklyAttendance:", e.message); }

            // Recent activity
            try {
                recentActivity = await mysql.Query(`
                    SELECT
                        mu_id as id, CONCAT(mu_firstName, ' ', mu_lastName) as name,
                        mu_email as email,
                        mu_createdAt as createdAt,
                        mu_role as role,
                        'NEW_REGISTRATION' as activityType
                    FROM master_user WHERE mu_status != 'DELETED'
                    ORDER BY mu_createdAt DESC LIMIT 10`);
            } catch (e) { console.error("Query error - recentActivity:", e.message); }

            res.json({
                message: "Success",
                data: {
                    overview: {
                        totalMembers,
                        newThisMonth,
                        memberGrowth,
                        monthlyRevenue,
                        revenueGrowth,
                        activeToday,
                        totalSessions,
                        activeSessions
                    },
                    statusBreakdown,
                    roleBreakdown,
                    revenueTrend,
                    weeklyAttendance,
                    recentActivity
                }
            });

        } catch (error) {
            console.error("AdminController.getDashboardAnalytics: ", error);
            res.status(500).json({
                message: "Server Error (500)",
                error: error.message
            });
        }
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
                mu.mu_profileIcon,
                mu.mu_phoneNumber,
                mu.mu_role,
                mu.mu_specialty,
                mu.mu_status,
                mu.mu_createdAt,
                mu.mu_updatedAt

            FROM master_user mu
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
                role, specialty, status } = req.body;

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
                mu_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            const result = await mysql.Query(sql, [email, username,
                hashedPassword, firstName, lastName, phoneNumber, role,
                specialty, status]);

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
                role, specialty, status } = req.body;

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
                const user = await mysql.Query(`
                    SELECT mu_password
                    FROM master_user
                    WHERE mu_id = ?`, [id]);
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
                mu_status = ?
            WHERE mu_id = ?`;

            const result = await mysql.Query(sql, [email, username, hashedPassword,
                firstName, lastName, phoneNumber, role, specialty, status, id]);

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
                mu_deletedAt = NOW()
            WHERE mu_id = ?`;

            const result = await mysql.Query(sql, [id]);

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


    // PUT /admin/bulk-delete
    static async bulkDeleteUsers(req, res) {
        try {

            if (!req.user?.id || req.user.role !== "ADMIN") {
                return res.status(401).json({
                    message: "Admin authentication required (Bearer token)"
                });
            }

            const { ids } = req.body;

            // IDS VALIDATION
            if (!ids || !Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({
                    message: "Valid array of IDs required"
                });
            }

            // Filter out invalid IDs
            const validIds = ids.filter(id => !isNaN(id) && id > 0);
            if (validIds.length === 0) {
                return res.status(400).json({
                    message: "No valid IDs provided"
                });
            }

            // OLD USERS FOR SYSTEM LOGGING
            const oldUsers = await mysql.Query(`
                SELECT
                    mu_id,
                    mu_username,
                    mu_email,
                    mu_role
                FROM master_user
                WHERE mu_id IN (?)`, [validIds]);

            const sql = `
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
                    mu_deletedAt = NOW()
                WHERE mu_id IN (?)`;

            const result = await mysql.Query(sql, [validIds]);

            // SYSTEM LOGGING - SUCCESS
            await SystemLogger.logAction(
                req.user.id,
                req.ip,
                req.get("User-Agent"),
                "USERS_BULK_DELETED",
                "master_user",
                null,
                oldUsers,
                {
                    deletedIds: validIds,
                    deletedBy: req.user.id
                }
            );

            res.status(200).json({
                message: `${result.affectedRows} user(s) have been soft deleted`,
                affectedRows: result.affectedRows
            });

        } catch (error) {
            console.error("AdminController.bulkDeleteUsers: ", error);
            res.status(500).json({
                message: "Server Error (500)"
            });
        }
    }
}

module.exports = AdminController;