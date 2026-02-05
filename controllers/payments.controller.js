const mysql = require('../services/dbconnect.js');
const SystemLogger = require('../services/systemLogger.js');
const XenditService = require('../services/xenditService.js');

class PaymentsController {
    // GET /payments/ DASHBOARD PAGE
    static getDashboard(req, res) {
        res.render("payments", {title: "Payments"});
    }


    // GET /payments/load
    static async loadPayments(req, res) {
        try {
            
            if(!req.user?.id || req.user.role !== "ADMIN") {
                return res.status(401).json({
                    message: "Admin authentication required (Bearer token)"
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

            const { membershipId, userId, originalAmount,
            voucherCode, isProductSale = false } = req.body;

            // VALIDATION
            if (!userId || !originalAmount) {
                return res.status(400).json({
                    message: "userId, originalAmount required. membershipId optional for products",
                    example: {
                        membership: { membershipId: 1, userId: 123, originalAmount: 1500 },
                        product: { userId: 123, originalAmount: 500, isProductSale: true }
                    }
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

            // DYNAMIC EXTERNAL ID + DESCRIPTION
            const externalID = isProductSale 
                ? `PROD_${userId}_${Date.now()}`
                : `PLFIT_${membershipId}_${userId}_${Date.now()}`;

            const description = isProductSale
                ? `PLFitness Products Order`
                : `PLFitness Membership #${membershipId}`;

            // CREATE XENDIT INVOICE
            const xenditInvoice = await XenditService.createInvoice({
                external_id: externalID,
                payer_email: req.user.email || `member${userId}@plfitness.ph`,
                description: description,
                amount: finalAmount,
                currency: 'PHP',
                days_active: 1,
                success_redirect_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success?external_id=${externalID}`,
                failure_redirect_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/failed`
            });

            // SAVE PENDING PAYMENT
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
                VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, NULL)`,
                [membershipId || null, userId, voucherId, parseFloat(originalAmount),
                discountAmount, finalAmount, 'OTHER', `Xendit Invoice: ${xenditInvoice.id} | Ext: ${externalID}`]
            );

            // SYSTEM LOGGING - SUCCESS
            await SystemLogger.logAction(
                req.user.id,
                req.ip,
                req.get("User-Agent"),
                isProductSale ? "XENDIT_PRODUCT_PAYMENT_CREATED" : "XENDIT_PAYMENT_CREATED",
                "master_payment",
                result.insertId,
                null,
                JSON.stringify({
                    membershipId: membershipId || null,
                    userId,
                    originalAmount,
                    voucherCode,
                    discountAmount,
                    finalAmount,
                    externalID,
                    xenditInvoiceId: xenditInvoice.id,
                    isProductSale
                })
            );

            res.status(201).json({
                message: "Xendit payment created successfully",
                data: {
                    id: result.insertId,
                    xenditInvoiceUrl: xenditInvoice.invoice_url,
                    externalID,
                    isProductSale,
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
            if (!id || !originalAmount || !mop || !['CASH', 'CREDIT', 'OTHER'].includes(mop)) {
                return res.status(400).json({
                    message: "id, originalAmount, mop required. mop must be CASH/CREDIT/OTHER"
                });
            }
            if (status && !['PAID', 'PENDING', 'CANCELLED', 'REFUNDED'].includes(status)) {
                return res.status(400).json({
                    message: "status must be PAID/PENDING/CANCELLED/REFUNDED"
                });
            }

            // GET EXISTING PAYMENT FOR COMPARISON
            const existingResult = await mysql.Query(
                `SELECT
                    mp_originalAmount,
                    mp_voucherId,
                    mp_userId,
                    mp_membershipId
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

            if ((status || "PAID") === 'PAID' && existing.mp_membershipId) {
            // CHECK PAYMENTS
            const paymentDetails = await mysql.Query(`
                SELECT
                    mp_membershipId,
                    mp_id
                FROM master_payment
                WHERE mp_id = ?
                AND mp_membershipId IS NOT NULL
            `, [id]);
            
            if (paymentDetails[0] && paymentDetails[0].mp_membershipId) {
                // UPGRADE IF MEMBERSHIP
                const membershipResult = await mysql.Query(`
                    UPDATE master_membership
                    SET mm_planType = 'PREMIUM',
                        mm_status = 'ACTIVE'
                    WHERE mm_id = ?
                    AND mm_totalPaid >= COALESCE(mm_price, 0)
                `, [paymentDetails[0].mp_membershipId]);
                
                if (membershipResult.affectedRows > 0) {
                    console.log(`Membership ${paymentDetails[0].mp_membershipId} auto-upgraded to PREMIUM`);
                    }
                }
            }

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
                        return res.status(400).json({
                            message: `Voucher expired. Valid ${voucher.mv_validFrom} to ${voucher.mv_validUntil}`
                        });
                    }
                    if (voucher.mv_useCount >= (voucher.mv_maxUses || 99999)) {
                        return res.status(400).json({
                            message: "Voucher maximum uses reached"
                        });
                    }
                    if (voucher.mv_minSpend && parseFloat(originalAmount) < voucher.mv_minSpend) {
                        return res.status(400).json({
                            message: `Minimum spend ${voucher.mv_minSpend} required`
                        });
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

            if (result.affectedRows === 0)
                return res.status(404).json({
                message:"Payment not found"
            });

            // SYSTEM LOGGING - SUCCESS
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

            const existingPayment = await mysql.Query(`
                SELECT
                    mp_notes,
                    mp_status,
                    mp_id
                FROM master_payment
                WHERE mp_id = ?`, [id]);

            if (existingPayment.length === 0) {
                return res.status(404).json({
                    message: "Payment not found"
                });
            }

            const payment = existingPayment[0];

            // XENDIT PROTECTION
            if (payment.mp_notes?.includes('Xendit') && payment.mp_status === 'PENDING') {
                return res.status(400).json({ 
                    message: "Cannot cancel pending Xendit payment. Expire via Xendit dashboard or wait 24h" 
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

            // MAKE SURE THIS IS COMMENTED IN IF YOU ARE DOING LOCAL TESTING
            // const signature = req.headers['x-callback-token'];
            // if (signature && !XenditService.verifyWebhookSignature(event, signature)) {
            //     return res.status(401).json({ 
            //         error: "Invalid signature" 
            //     });
            // }

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
                WHERE mp_id IN (
                SELECT mp_id FROM master_payment
                WHERE mp_notes LIKE ?
                OR mp_notes LIKE ?)
                AND mp_status = 'PENDING'`, [`%${externalID}%`, `%${event.data.id}%`]);

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

                if (payment.mp_membershipId) {
                const membershipResult = await mysql.Query(`
                    UPDATE master_membership
                    SET mm_planType = 'PREMIUM',
                    mm_status = 'ACTIVE'
                    WHERE mm_id = ?
                    AND mm_totalPaid >= COALESCE(mm_price, 0)
                `, [payment.mp_membershipId]);
                
                if (membershipResult.affectedRows > 0) {
                    console.log(`Webhook upgraded membership ${payment.mp_membershipId}`);
                }
            }

                // SYSTEM LOGGING - SUCCESS
                await SystemLogger.logAction(
                    null,
                    req.ip,
                    req.get("User-Agent"),
                    "XENDIT_WEBHOOK_RECEIVED",
                    "master_payment",
                    null,
                    null,
                    JSON.stringify({
                        event: event.event,
                        external_id: event.data?.external_id,
                        invoice_status: event.data?.status,
                        invoice_id: event.data?.id,
                        created: event.data?.created_at,
                        updated: event.data?.updated_at,
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