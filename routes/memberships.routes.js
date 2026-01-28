const express = require('express');
const router = express.Router();
const MembershipController = require('../controllers/memberships.controller');

// DASHBOARD PAGE
router.get("/", MembershipController.getDashboard);

// API ENDPOINTS
router.get("/load", MembershipController.loadMemberships);
router.post("/insert", MembershipController.createMembership);
router.put("/update", MembershipController.updateMembership);
router.put("/delete", MembershipController.deleteMembership);

module.exports = router;