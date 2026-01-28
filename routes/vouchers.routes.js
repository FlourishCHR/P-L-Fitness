const express = require('express');
const router = express.Router();
const VouchersController = require('../controllers/vouchers.controller');

// DASHBOARD PAGE
router.get("/", VouchersController.getDashboard);

// API ENDPOINTS
router.get("/load", VouchersController.loadVouchers);
router.post("/insert", VouchersController.createVoucher);
router.put("/update", VouchersController.updateVoucher);
router.put("/use", VouchersController.useVoucher);
router.post("/reset-use", VouchersController.resetVoucherUse);

module.exports = router;