const express = require('express');
const router = express.Router();
const AttendanceController = require('../controllers/attendance.controller');

// DASHBOARD PAGE
router.get("/", AttendanceController.getDashboard);

// API ENDPOINTS
router.get("/load", AttendanceController.loadAttendance);
router.post("/checkin", AttendanceController.checkin);
router.put("/checkout", AttendanceController.checkout);
router.put("/delete", AttendanceController.deleteAttendance);

module.exports = router;