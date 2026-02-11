const express = require('express');
const router = express.Router();
const AttendanceController = require('../controllers/attendance.controller');

// DASHBOARD PAGE
router.get("/", AttendanceController.getDashboard);

// API ENDPOINTS
router.get("/load", AttendanceController.loadAttendance);
router.post("/checkin", AttendanceController.checkin);
router.get("/qrcode/checkin", AttendanceController.generateCheckInQR);
router.put("/checkout", AttendanceController.checkout);
router.get("/qrcode/checkout/:ma_id", AttendanceController.generateCheckoutQR);
router.put("/delete", AttendanceController.deleteAttendance);
router.get('/staff/scan', AttendanceController.staffScan);

module.exports = router;