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
                    role: user[0].mu_role
                  },
                  process.env.JWT_SECRET,
                  { expiresIn:'1h' }
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
            res.status(500).json({
                message: "Server Error (500)"
            });
        }
    }
}

module.exports = AuthController;