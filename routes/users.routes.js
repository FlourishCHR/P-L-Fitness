const express = require('express');
const router = express.Router();
const UserController = require('../controllers/users.controller');

// DASHBOARD PAGE
router.get("/", UserController.getDashboard); 

// API ENDPOINTS
router.get("/profile", UserController.getProfile);
router.put("/profile", UserController.updateProfile);
router.get("/points", UserController.getPoints);
router.get("/my-checkin", UserController.getMyOpenCheckin);

module.exports = router;