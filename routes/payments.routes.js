const express = require('express');
const router = express.Router();
const PaymentsController = require('../controllers/payments.controller');

// DASHBOARD PAGE
router.get("/", PaymentsController.getDashboard);

// API ENDPOINTS
router.get("/load", PaymentsController.loadPayments);
router.post("/insert", PaymentsController.createPayment);
router.put("/update", PaymentsController.updatePayment);
router.put("/delete", PaymentsController.deletePayment);
router.post("/webhook", PaymentsController.xenditWebhook);

module.exports = router;