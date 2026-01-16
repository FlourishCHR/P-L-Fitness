const mysql = require('../services/dbconnect.js');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SystemLogger = require('../services/systemlogger.js');

class AuthController {
    // GET /auth/ -- PAGE
    static getDashboard(req, res) {
        res.render("auth", {title: "Auth"});
    }

    // POST /auth/login
    static async login(req, res) {
        try {
            
            const { username, password } = req.body;

            // VALIDATION
            if (!username || !password || typeof username !== "string" || username.length < 3) {
                await SystemLogger.logAction(
                    null,
                    req.ip,
                    req.get("User-Agent"),
                    "USER_LOGIN_INVALID_INPUT",
                    "master_user",
                    null,
                    null,
                    null,
                    "FAILED",
                    "INVALID username/password"
                );
                return res.status(400).json({
                    message: "Username and Password required"
                });
            }

            const sql =`
            SELECT * FROM master_user
            WHERE mu_username = ?
            AND mu_status != 'DELETED'`;

            const user = await mysql.Query(sql, [username]);

            // VALIDATE CREDENTIALS
            if (!user.length || !await bcryptjs.compare(password, user[0].mu_password)) {

                // SYSTEM LOGGING - FAILED ATTEMPT
                await SystemLogger.logAction(
                    null,
                    req.ip,
                    req.get("User-Agent"),
                    "USER_LOGIN_FAILED",
                    "master_user",
                    null,
                    null,
                    {
                        attemptedUsername: username
                    }
                );

                return res.status(401).json({
                    message: "INVALID CREDENTIALS"
                });
            }

            // GENERATE JsonWebToken (JWT)
            const token = jwt.sign(
                  { id: user[0].mu_id,
                    role: user[0].mu_role},
                  process.env.JWT_SECRET,
                  { expiresIn:'8h' }
                );

                // SYSTEM LOGGING - LOGIN SUCCESS
                await SystemLogger.logAction(
                    user[0].mu_id, // who logged in
                    req.ip,
                    req.get("User-Agent"),
                    "USER_LOGIN_SUCCESS",
                    "master_user",
                    user[0].mu_id,
                    null,
                    {
                        role: user[0].mu_role // context
                    }
                );
                
                res.json({
                    token,
                    user: {
                        id: user[0].mu_id,
                        role: user[0].mu_role
                    }
                });

        } catch (error) {
            // SYSTEM LOGGING - ERROR
            await SystemLogger.logAction(
                null,
                req.ip,
                req.get("User-Agent"),
                "USER_LOGIN_ERROR",
                "master_user",
                null,
                null,
                null,
                "FAILED",
                error.message
            );
            res.status(500).json({
                message: "Server Error (500)"
            });
        }
    }


    // POST /auth/refresh
    static async refresh(req, res) {
        try {
            
            const token = req.headers.authorization?.split(' ')[1];

            if (!token) {
                return res.status(401).json({
                    message: "Token Required"
                });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            if (!decoded.id) {
                return res.status(401).json({
                    message: "Invalid token structure"
                });
            }

            const user = await mysql.Query(`
                SELECT
                    mu_id,
                    mu_role
                FROM master_user
                WHERE mu_id = ?
                AND mu_status != 'DELETED'`,[decoded.id]);

            if (!user.length) {
                return res.status(401).json({
                    message: "User not found"
                });
            }

            // GENERATE NEW TOKEN
            const newToken = jwt.sign(
                {id: user[0].mu_id,
                role: user[0].mu_role},
                process.env.JWT_SECRET,
                { expiresIn: '8h' }
            );

            // SYSTEM LOGGING - TOKEN REFRESHED
            await SystemLogger.logAction(
                user[0].mu_id,
                req.ip,
                req.get("User-Agent"),
                "TOKEN_REFRESHED",
                "auth",
                null,
                null,
                { userId: user[0].mu_id },
                "SUCCESS"
            );

            res.json({
                token: newToken,
                user: {
                    id: user[0].mu_id,
                    role: user[0].mu_role
                }
            });

        } catch (error) {
            // SYSTEM LOGGING - ERROR
            await SystemLogger.logAction(
                null,
                req.ip,
                req.get("User-Agent"),
                "TOKEN_REFRESH_FAILED",
                "auth",
                null,
                null,
                null,
                "FAILED",
                error.message
            );
            res.status(401).json({
                message: "Token expired or invalid"
            });
        }
    }

    // POST /auth/logout
    static async logout (req, res) {
        try {
            // SYSTEM LOGGING - SUCCESS
            if (req.user?.id) {
                await SystemLogger.logAction(
                    req.user.id,
                    req.ip,
                    req.get("User-Agent"),
                    "USER_LOGGED_OUT",
                    "master_user",
                    req.user.id,
                    null,
                    { method: "CLIENT_TOKEN_CLEARED" },
                    "SUCCESS"
                );
            }
            res.json({
                message: "Logged out successfully"
            })
        } catch (error) {
            // SYSTEM LOGGING - ERROR
            await SystemLogger.logAction(
                req.user?.id || null,
                req.ip,
                req.get("User-Agent"),
                "USER_LOGOUT_FAILED",
                "master_user",
                null,
                null,
                null,
                "FAILED",
                error.message
            );
            res.status(500).json({
                message: "Server Error (500)"
            });
        }
    }
}

module.exports = AuthController;