const mysql = require('../services/dbconnect.js');
const SystemLogger = require('../services/systemLogger.js');
const XenditService = require('../services/XenditService.js');

class PaymentsController {
    // GET /payments/ DASHBOARD PAGE
    static getDashboard(req, res) {
        res.render("payments", {title: "Payments"});
    }


    // GET /payments/load
    static async loadPayments(req, res) {
        try {
            
            if(!req.user?.id) {
                return res.status(401).json({
                    message: "Authentication required (Bearer token)"
                });
            }

            const sql =`
            SELECT
                mp.mp_id,
                mp.mp_userId,
                CONCAT(mu.mu_firstName, ' ', mu.mu_lastName) as memberName,
                mp.mp_membershipId,
                mm.mm_planType,
                mp.mp_originalAmount,
                mp.mp_discountAmount,
                mp.mp_finalAmount,
                mv.mv_code as voucherCode,
                mp.mp_mop,
                mp.mp_status,
                mp.mp_paymentDate
            FROM master_payment mp
            LEFT JOIN master_user mu ON mp.mp_userId = mu.mu_id
            LEFT JOIN master_membership mm ON mp.mp_membershipId = mm.mm_id
            LEFT JOIN master_voucher mv ON mp.mp_voucherId = mv.mv_id
            -- WHERE mp.mp_status != 'DELETED' -- delete this to see 'DELETED' status
            -- AND mu.mu_status != 'DELETED' -- delete this to see 'DELETED' status
            ORDER BY mp.mp_paymentDate DESC`;

            const result = await mysql.Query(sql);

            // SYSTEM LOGGING - SUCCESS
            await SystemLogger.logAction(
                req.user.id,
                req.ip,
                req.get("User-Agent"),
                "PAYMENTS_LISTED",
                "master_payment",
                null,
                null,
                null
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
                    "PAYMENTS_LIST_FAILED",
                    "master_payment",
                    null,
                    null,
                    null,
                    "FAILED",
                    error.message
                );
            }
            console.error("PaymentsController.loadPayments: ", error);
            res.status(500).json({
                message: "Error fetching payments",
                data: error
            });
        }
    }


    // POST /payments/insert
    static async createPayment(req, res) {
        try {

            if (!req.user?.id) {
                return res.status(401).json({
                    message: "Authentication required (Bearer token)"
                });
            }

            const { membershipId, userId, originalAmount, voucherCode } = req.body;

            // VALIDATION
            if (!membershipId || !userId || !originalAmount) {
                return res.status(400).json({
                    message: "membershipId, userId, originalAmount required",
                    validStatus: ["PAID", "PENDING", "CANCELLED", "REFUNDED"]
                });
            }

            // VOUCHER PROCESSING
            let voucherId = null;
            let discountAmount = 0;
            let finalAmount = parseFloat(originalAmount);

            if (voucherCode) {
                const voucherResult = await mysql.Query(`
                    SELECT
                        mv_id,
                        mv_discountType,
                        mv_value,
                        mv_minSpend,
                        mv_validFrom,
                        mv_validUntil,
                        mv_useCount,
                        mv_maxUses,
                        mv_userId
                    FROM master_voucher 
                    WHERE mv_code = ?
                    AND mv_status = 'ACTIVE' FOR UPDATE`, [voucherCode]);

                if (voucherResult.length > 0) {
                    const voucher = voucherResult[0];
                    const today = new Date().toISOString().split('T')[0];

                    if (today < voucher.mv_validFrom || today > voucher.mv_validUntil) {
                        return res.status(400).json({
                            message: `Voucher expired. Valid ${voucher.mv_validFrom} to ${voucher.mv_validUntil}`
                        });
                    }

                    if (voucher.mv_useCount >= (voucher.mv_maxUses || 99999)) {
                        return res.status(400).json({ message: "Voucher maximum uses reached" });
                    }

                    if (voucher.mv_userId && voucher.mv_userId == userId) {
                        return res.status(400).json({ message: "Voucher already used by this member" });
                    }

                    if (voucher.mv_minSpend && parseFloat(originalAmount) < voucher.mv_minSpend) {
                        return res.status(400).json({
                            message: `Minimum spend ${voucher.mv_minSpend} required`
                        });
                    }

                    // CALCULATE DISCOUNT
                    if (voucher.mv_discountType === 'FIXED') {
                        discountAmount = Math.min(voucher.mv_value, parseFloat(originalAmount));
                    } else {
                        discountAmount = parseFloat(originalAmount) * (voucher.mv_value / 100);
                    }

                    finalAmount = parseFloat((parseFloat(originalAmount) - discountAmount).toFixed(2));
                    voucherId = voucher.mv_id;
                }
            }

            // XENDIT VALIDATION
            if (!process.env.XENDIT_SECRET_KEY) {
            return res.status(500).json({
                message: "Xendit configuration missing"
                });
            }

            // CREATE UNIQUE XENDIT EXTERNAL ID
            const externalID = `PLFIT_${membershipId}_${userId}_${Date.now()}`;
            console.log("🔍 externalID:", externalID);


            // CREATE XENDIT INVOICE
            const xenditInvoice = await XenditService.createInvoice({
                external_id: externalID,
                payer_email: req.user.email || `member${userId}@plfitness.ph`,
                description: `PLFitness Membership #${membershipId}`,
                amount: Math.round(finalAmount * 100),
                currency: 'PHP',
                days_active: 1,
                success_redirect_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success?external_id=${externalID}`,
                failure_redirect_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/failed`,
            });

            // SAVE PENDING PAYMENT TO DB
            const result = await mysql.Query(`
                INSERT INTO master_payment
                    (mp_membershipId,
                    mp_userId,
                    mp_voucherId,
                    mp_originalAmount,
                    mp_discountAmount,
                    mp_finalAmount,
                    mp_mop,
                    mp_status,
                    mp_notes,
                    mp_paymentDate)
                VALUES (?, ?, ?, ?, ?, ?, 'XENDIT', 'PENDING_XENDIT', ?, NULL)`,
                [membershipId, userId, voucherId, parseFloat(originalAmount), 
                discountAmount, finalAmount, `Xendit Invoice: ${xenditInvoice.id}`]
            );

            // SYSTEM LOGGING - SUCCESS
            await SystemLogger.logAction(
                req.user.id,
                req.ip,
                req.get("User-Agent"),
                "XENDIT_PAYMENT_CREATED",
                "master_payment",
                result.insertId,
                null,
                JSON.stringify({
                    membershipId,
                    userId,
                    originalAmount,
                    voucherCode,
                    discountAmount,
                    finalAmount,
                    externalID,
                    xenditInvoiceId: xenditInvoice.id
                })
            );

            res.status(201).json({
                message: "Xendit payment created successfully",
                data: {
                    id: result.insertId,
                    xenditInvoiceUrl: xenditInvoice.invoice_url,
                    externalID,
                    originalAmount: parseFloat(originalAmount),
                    discountAmount,
                    finalAmount,
                    voucherCode: voucherCode || null
                }
            });

        } catch (error) {
            // SYSTEM LOGGING - ERROR
            if (req.user?.id) {
                await SystemLogger.logAction(
                    req.user.id,
                    req.ip,
                    req.get("User-Agent"),
                    "XENDIT_PAYMENT_CREATE_FAILED",
                    "master_payment",
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
            console.error("PaymentsController.createPayment: ", error);
            res.status(500).json({
                message: "Server Error (500)",
                data: error
            });
        }
    }


    // PUT /payments/update
    static async updatePayment(req, res) {
        try {
            
            if (!req.user?.id || req.user.role !== "ADMIN") {
                return res.status(401).json({
                    message: "Admin authentication required (Bearer token)"
                });
            }

            const { id, originalAmount, voucherCode, mop, status } = req.body;

            // VALIDATION
            if (!id || !originalAmount || !mop) {
                return res.status(400).json({
                    message: "id, originalAmount, mop required"
                });
            }

            // GET EXISTING PAYMENT FOR COMPARISON
            const existingResult = await mysql.Query(
                `SELECT
                    mp_originalAmount,
                    mp_voucherId,
                    mp_userId
                FROM master_payment
                WHERE mp_id = ?`, [id]);

            if (existingResult.length === 0) return res.status(404).json({
                message: "Payment not found" 
                });

            const existing = existingResult[0];
            let voucherId = existing.mp_voucherId || null;
            let discountAmount = 0;
            let finalAmount = parseFloat(originalAmount);
            const userId = existing.mp_userId;

            if (voucherCode && (!existing.mp_voucherId || voucherCode !== existing.mp_voucherId)) {
                const voucherResult = await mysql.Query(`
                    SELECT
                        mv_id,
                        mv_discountType,
                        mv_value,
                        mv_minSpend,
                        mv_status, 
                        mv_validFrom,
                        mv_validUntil,
                        mv_useCount,
                        mv_maxUses,
                        mv_userId
                    FROM master_voucher
                    WHERE mv_code = ?
                    AND mv_status = 'ACTIVE' FOR UPDATE`, [voucherCode]);

                if (voucherResult.length > 0) {
                    const voucher = voucherResult[0];
                    const today = new Date().toISOString().split('T')[0];

                    if (today < voucher.mv_validFrom || today > voucher.mv_validUntil) {
                        return res.status(400).json({ message: `Voucher expired. Valid ${voucher.mv_validFrom} to ${voucher.mv_validUntil}` });
                    }
                    if (voucher.mv_useCount >= (voucher.mv_maxUses || 99999)) {
                        return res.status(400).json({ message: "Voucher maximum uses reached" });
                    }
                    if (voucher.mv_minSpend && parseFloat(originalAmount) < voucher.mv_minSpend) {
                        return res.status(400).json({ message: `Minimum spend ${voucher.mv_minSpend} required` });
                    }

                    if (voucher.mv_discountType === 'FIXED') {
                        discountAmount = Math.min(voucher.mv_value, parseFloat(originalAmount));
                    } else {
                        discountAmount = parseFloat(originalAmount) * (voucher.mv_value / 100);
                    }
                    finalAmount = parseFloat((parseFloat(originalAmount) - discountAmount).toFixed(2));
                    voucherId = voucher.mv_id;
                }
            }

            const result = await mysql.Query(`
                UPDATE master_payment
                SET
                    mp_originalAmount = ?,
                    mp_discountAmount = ?,
                    mp_finalAmount = ?,
                    mp_voucherId = ?,
                    mp_mop = ?,
                    mp_status = ?
                    WHERE mp_id = ?`,
                [parseFloat(originalAmount), discountAmount, finalAmount,
                    voucherId, mop, status || "PAID", id]);

            if (result.affectedRows === 0) return res.status(404).json({ message: "Payment not found" });

            await SystemLogger.logAction(
                req.user.id,
                req.ip,
                req.get("User-Agent"),
                "PAYMENT_UPDATED",
                "master_payment",
                id,
                null,
                JSON.stringify({ 
                    id,
                    originalAmount,
                    discountAmount,
                    finalAmount,
                    voucherCode: voucherCode || null,
                    mop,
                    status: status || "PAID" 
                })
            );

            res.status(200).json({
                message: "Payment updated successfully",
                affectedRows: result.affectedRows,
                data: { 
                    originalAmount,
                    discountAmount,
                    finalAmount
                }
            });

        } catch (error) {
            // SYSTEM LOGGING - ERROR
            if(req.user?.id) {
                await SystemLogger.logAction(
                    req.user.id,
                    req.ip,
                    req.get("User-Agent"),
                    "PAYMENT_UPDATE_FAILED",
                    "master_payment",
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
            console.error("PaymentsController.updatePayment: ", error);
            res.status(500).json({
                message: "Server Error (500)",
                data: error
            });
        }
    }


    // PUT /payments/delete
    static async deletePayment(req, res) {
        try {
            
            if(!req.user?.id || req.user.role !== "ADMIN") {
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
            UPDATE master_payment
            SET mp_status = "CANCELLED"
            WHERE mp_id = ?`;

            const result = await mysql.Query(sql, [id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Payment not found"
                });
            }

            // SYSTEM LOGGING - SUCCESS
            await SystemLogger.logAction(
                req.user.id,
                req.ip,
                req.get("User-Agent"),
                "PAYMENT_DELETED",
                "master_payment",
                id,
                null,
                JSON.stringify({ id })
            );

            res.status(200).json({
                    message: "Payment has been soft deleted",
                    affectedRows: result.affectedRows
                });

        } catch (error) {
            // SYSTEM LOGGING - ERROR
            if(req.user?.id) {
                await SystemLogger.logAction(
                    req.user.id,
                    req.ip,
                    req.get("User-Agent"),
                    "PAYMENT_DELETE_FAILED",
                    "master_payment",
                    id,
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
            console.error("PaymentsController.deletePayment: ", error);
            res.status(500).json({
                message: "Server Error (500)",
                data: error
            });
        }
    }


    // POST /payments/webhook
    static async xenditWebhook(req, res) {
        try {
            
            const event = req.body;

            // SYSTEM LOGGING - WEBHOOK RECEIVED
            await SystemLogger.logAction(
                null,
                req.ip,
                req.get("User-Agent"),
                "XENDIT_WEBHOOK_RECEIVED",
                "master_payment",
                event.data?.external_id || null,
                null,
                JSON.stringify({
                    event: event.event,
                    external_id: event.data?.external_id,
                    invoice_status: event.data?.status,
                    invoice_id: event.data?.id,
                    created: event.data?.created_at,
                    updated: event.data?.updated_at
                })
            );

            if (event.event === "invoice.paid") {
            const externalID = event.data.external_id;
            
            const [payment] = await mysql.Query(`
                SELECT * FROM master_payment
                WHERE mp_notes LIKE ? AND mp_status = 'PENDING_XENDIT'`, 
                [`%${externalID}%`]
            );

            if (payment) {
                await mysql.Query(`
                    UPDATE master_payment
                    SET mp_status = 'PAID',
                        mp_paymentDate = NOW(),
                        mp_confirmedAt = NOW(),
                        mp_notes = ?
                    WHERE mp_id = ?`,
                    [`Xendit PAID: ${event.data.id}`, payment.mp_id]
                );

                // SYSTEM LOGGING - SUCCESS
                await SystemLogger.logAction(
                    null,
                    req.ip,
                    req.get("User-Agent"),
                    "XENDIT_PAYMENT_CONFIRMED",
                    "master_payment",
                    payment.mp_id,
                    null,
                    JSON.stringify({
                        payment_id: payment.mp_id,
                        xendit_invoice_id: event.data.id,
                        external_id: externalID,
                        amount: event.data.amount,
                        status: "PAID"
                    })
                );
            }
        }

        res.status(200).json({
            status: "OK"
        });

        } catch (error) {
            // SYSTEM LOGGING - ERROR
            await SystemLogger.logAction(
                null,
                req.ip,
                req.get("User-Agent") || "UNKNOWN",
                "XENDIT_WEBHOOK_FAILED",
                "master_payment",
                null,
                null,
                null,
                "FAILED",
                error.message
            );
            console.error("Xendit Webhook:", error);

            res.status(500).json({
                error: "Webhook processing Failed"
            });
        }
    }
}

module.exports = PaymentsController;