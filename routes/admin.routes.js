const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/admin.controller');

// DASHBOARD PAGE
router.get("/", AdminController.getDashboard);

// API ENDPOINTS
router.post("/seed-admin", AdminController.seedAdmin);
router.get("/load", AdminController.loadUsers);
router.post("/insert", AdminController.createUser);
router.put("/update", AdminController.updateUser);
router.put("/delete", AdminController.deleteUser);

module.exports = router;