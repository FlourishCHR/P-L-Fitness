const mysql = require('../services/dbconnect.js');
const SystemLogger = require('../services/systemLogger.js');

class VouchersController {
    // GET /vouchers/ DASHBOARD PAGE
    static getDashboard(req, res) {
        res.render("vouchers", {title: "Vouchers"});
    }


    // GET /vouchers/load
    static async loadVouchers(req, res) {
        try {

            if (!req.user?.id) {
                return res.status(401).json({
                    message: "Authentication required (Bearer token)"
                });
            }
            
            const sql =`
            SELECT
                mv.mv_id,
                mv.mv_code,
                mv.mv_description,
                mv.mv_discountType,
                mv.mv_value,
                mv.mv_pointsRequired,
                mv.mv_minSpend,
                mv.mv_maxUses,
                mv.mv_useCount,
                mv.mv_validFrom,
                mv.mv_validUntil,
                mv.mv_status,
                mv.mv_createdAt,
                CONCAT(mu.mu_firstName, ' ', mu.mu_lastName) as usedByName
            FROM master_voucher mv
            LEFT JOIN master_user mu ON mv.mv_userId = mu.mu_id
            -- WHERE mv_status != 'DEACTIVATED' -- delete to see deleted status
            ORDER BY mv.mv_id DESC`;

            const result = await mysql.Query(sql);
            // SYSTEM LOGGING - SUCCESS
            await SystemLogger.logAction(
                req.user.id,
                req.ip,
                req.get("User-Agent"),
                "VOUCHERS_LIST_VIEWED",
                "master_voucher",
                null,
                null,
                JSON.stringify({
                    userId: req.user.id,
                    totalVouchers: result.length,
                    activeVouchers: result.filter(v => v.mv_status !== "DEACTIVATED").length
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
                    "VOUCHERS_LOAD_FAILED",
                    "master_voucher",
                    null,
                    null,
                    "FAILED",
                    error.message
                );
            }
            console.error("VouchersController.loadVouchers: ", error);
            res.status(500).json({
                message: "Error fetching vouchers",
                data: error
            });
        }
    }


    // POST /vouchers/insert
    static async createVoucher(req, res) {
        try {
            
            if (!req.user?.id) {
                return res.status(401).json({
                    message: "Authentication required (Bearer token)"
                });
            }

            const { code, description, discountType, value,
                minSpend, maxUses, useCount, validFrom, validUntil, status } = req.body;

            
            // VALIDATION
            if (!code || !discountType || !value || !validFrom || !validUntil || !status) {
                return res.status(400).json({
                    message: "code, discountType, value, validFrom, validUntil, status required"
                });
            }

            const sql =`
            INSERT INTO master_voucher
                (mv_code,
                mv_description,
                mv_discountType,
                mv_value,
                mv_minSpend,
                mv_maxUses,
                mv_useCount,
                mv_validFrom,
                mv_validUntil,
                mv_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            const result = await mysql.Query(sql, [code, description || null,
                discountType, value, minSpend || 0, maxUses || 1, useCount || 0,
                validFrom, validUntil, status || "ACTIVE"]);

            // SYSTEM LOGGING - SUCCESS
            await SystemLogger.logAction(
                req.user.id,
                req.ip,
                req.get("User-Agent"),
                "VOUCHER_CREATED",
                "master_voucher",
                result.insertId,
                null,
                JSON.stringify({
                    adminUserId: req.user.id,
                    voucherId: result.insertId,
                    voucherCode: code,
                    discountType: discountType,
                    value: value
                })
            );

            res.status(201).json({
                message: "Voucher created successfully",
                data: {
                    mv_id: result.insertId
                }
            });

        } catch (error) {
            // SYSTEM LOGGING - ERROR
            if(req.user?.id) {
                await SystemLogger.logAction(
                    req.user.id,
                    req.ip,
                    req.get("User-Agent"),
                    "VOUCHER_CREATE_FAILED",
                    "master_voucher",
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
            console.error("VouchersController.createVoucher: ", error);
            res.status(500).json({
                message: "Server Error (500)",
                data: error
            });
        }
    }


    // PUT /vouchers/update
    static async updateVoucher(req, res) {
        try {
            
            if (!req.user?.id) {
                return res.status(401).json({
                    message: "Authentication required (Bearer token)"
                });
            }

            const { id, code, description, discountType, value,
                minSpend, maxUses, useCount, validFrom, validUntil, status } = req.body;


            // VALIDATION
            if (!id || !code || !discountType || !value || !validFrom || !validUntil || !status) {
                return res.status(400).json({
                    message: "id, code, discountType, value, validFrom, validUntil, status required"
                });
            }

            // UNIQUE CODE CHECKING
            const existing = await mysql.Query(`
                SELECT 1 FROM master_voucher
                WHERE mv_code = ?
                AND mv_id != ?`, [code, id]);
            if (existing.length > 0) {
                return res.status(409).json({
                    message: "Voucher code already exists"
                });
            }

            const sql =`
            UPDATE master_voucher
            SET
                mv_code = ?,
                mv_description = ?,
                mv_discountType = ?,
                mv_value = ?,
                mv_minSpend = ?,
                mv_maxUses = ?,
                mv_useCount = ?,
                mv_validFrom = ?,
                mv_validUntil = ?,
                mv_status = ?
            WHERE mv_id = ?`;

            const result = await mysql.Query(sql, [code, description || null,
                discountType, value, minSpend || 0, maxUses || 1,
                useCount || 0, validFrom, validUntil, status, id ]);

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Voucher not found"
                });
            }

            // SYSTEM LOGGING - SUCCESS
            await SystemLogger.logAction(
                req.user.id,
                req.ip,
                req.get("User-Agent"),
                "VOUCHER_UPDATED",
                "master_voucher",
                id,
                null,
                JSON.stringify({
                    userId: req.user.id,
                    voucherId: id,
                    voucherCode: code,
                    changes: {
                        discountType: discountType,
                        value: value,
                        status: status
                    },
                    affectedRows: result.affectedRows
                })
            );

            res.status(200).json({
                message: "Voucher has been updated",
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
                    "VOUCHER_UPDATE_FAILED",
                    "master_voucher",
                    id || null,
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
            console.error("VouchersController.updateVoucher: ", error);
            res.status(500).json({
                message: "Server Error (500)",
                data: error
            });
        }
    }


    // PUT /vouchers/use
    static async useVoucher(req, res) {
        try {
            
            if (!req.user?.id) {
                return res.status(401).json({
                    message: "Authentication required (Bearer token)"
                });
            }

            const { id } = req.body;

            if (!id || isNaN(id)) {
                return res.status(400).json({
                    message: "Valid voucher id required"
                });
            }

            const memberId = req.user.id;

            // USAGE CHECKING
            const [voucher] = await mysql.Query(`
                SELECT
                    mv_id,
                    mv_maxUses,
                    mv_useCount,
                    mv_status,
                    mv_validFrom,
                    mv_validUntil,
                    mv_userId,
                    mv_code
                FROM master_voucher
                WHERE mv_id = ?
                FOR UPDATE`, [id]);

            
            // VALIDATION
            if (!voucher) {
                return res.status(404).json({
                    message: "Voucher not found"
                });
            }

            // DATE COMPARISON
            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

            if (voucher.mv_status !== "ACTIVE") {
                return res.status(400).json({
                    message: "Voucher is inactive"
                });
            }

            if (voucher.mv_useCount >= (voucher.mv_maxUses || 99999)) {
                return res.status(400).json({
                    message: "Maximum uses reached"
                });
            }

            if (today < voucher.mv_validFrom || today > voucher.mv_validUntil) {
                return res.status(400).json({
                    message: `Voucher valid ${voucher.mv_validFrom} to ${voucher.mv_validUntil}`
                });
            }

            // PREVENT SAME USER DOUBLE REDEMPTION
            if (voucher.mv_userId === memberId) {
                return res.status(400).json({
                    message: "You already used this voucher"
                });
            }

            // ATOMIC UPDATE (useCount INCREMENT)
            const result = await mysql.Query(`
                UPDATE master_voucher
                SET
                    mv_useCount = mv_useCount + 1,
                    mv_userId = ?
                WHERE mv_id = ?
                AND mv_status = 'ACTIVE'
                AND COALESCE(mv_maxUses, 99999) > mv_useCount
                AND ? BETWEEN mv_validFrom and mv_validUntil`, [memberId, id, today]);

            if (result.affectedRows === 0) {
                return res.status(409).json({
                    message: "Voucher already used or expired"
                });
            }

            // SYSTEM LOGGING - SUCCESS
            await SystemLogger.logAction(
                req.user.id,
                req.ip,
                req.get("User-Agent"),
                "VOUCHER_REDEEMED",
                "master_voucher",
                id,
                null,
                JSON.stringify({
                    memberId: req.user.id,
                    voucherId: id,
                    voucherCode: voucher.mv_code,
                    previousUseCount: voucher.mv_useCount,
                    newUseCount: voucher.mv_useCount + 1,
                    remainingUses: (voucher.mv_maxUses || 99999) - (voucher.mv_useCount + 1)
                })
            );

            res.status(200).json({
                message: "Voucher redeemed successfully",
                details: {
                    code: voucher.mv_code || "N/A",
                    remainingUses: (voucher.mv_maxUses || "Unlimited") - (voucher.mv_useCount + 1),
                    redeemedBy: memberId
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
                    "master_voucher",
                    id || null,
                    null,
                    "FAILED",
                    error.message
                );
            }
            console.error("VouchersController.useVoucher: ", error);
            res.status(500).json({
                message: "Server Error (500)",
                data: error
            });
        }
    }


    // POST /vouchers/reset-use (ADMIN ONLY)
    static async resetVoucherUse(req, res) {
        try {
            
            if (!req.user?.id || req.user.role !== "ADMIN") {
                return res.status(401).json({
                    message: "Admin authentication required"
                });
            }

            const { voucherId } = req.body;

            if (!voucherId || isNaN(voucherId)) {
                return res.status(400).json({
                    message: "voucherId required"
                });
            }

            const result = await mysql.Query(`
                UPDATE master_voucher
                SET
                    mv_useCount = 0,
                    mv_userId = NULL
                WHERE mv_id = ?`, [voucherId]);

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Voucher not found"
                });
            }

            // SYSTEM LOGGING - SUCCESS
            await SystemLogger.logAction(
                req.user.id,
                req.ip,
                req.get("User-Agent"),
                "VOUCHER_RESET",
                "master_voucher",
                voucherId,
                null,
                JSON.stringify({
                    adminUserId: req.user.id,
                    voucherId: voucherId,
                    action: "use_count_reset_to_zero"
                })
            );

            res.status(200).json({
                message: "Voucher use count reset",
                affectedRows: result.affectedRows
            });

        } catch (error) {
            // SYSTEM LOGGING - ERROR
            if(req.user?.id) {
                await SystemLogger.logAction(
                    req.user.id,
                    req.ip,
                    req.get("User-Agent"),
                    "VOUCHER_RESET_FAILED",
                    "master_voucher",
                    voucherId || null,
                    null,
                    "FAILED",
                    error.message
                );
            }
            console.error("VouchersController.resetVoucherUse: ", error);
            res.status(500).json({
                message: "Server Error (500)",
                data: error
            });
        }
    }
}

module.exports = VouchersController;