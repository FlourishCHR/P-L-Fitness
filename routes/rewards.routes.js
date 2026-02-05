const express = require('express');
const router = express.Router();
const RewardsController = require('../controllers/rewards.controller');

// DASHBOARD PAGE
router.get("/", RewardsController.getDashboard);

// API ENDPOINTS
router.get("/load", RewardsController.loadRewards);
router.get("/admin-load", RewardsController.adminLoad);
router.post("/convert-attendance", RewardsController.convertAttendance);

module.exports = router;