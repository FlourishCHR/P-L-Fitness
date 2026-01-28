const express = require('express');
const router = express.Router();
const SessionsController = require('../controllers/sessions.controller');

// DASHBOARD PAGE
router.get("/", SessionsController.getDashboard);

// API ENDPOINTS
router.get("/load", SessionsController.loadSessions);
router.post("/insert", SessionsController.createSession);
router.put("/update", SessionsController.updateSession);
router.put("/delete", SessionsController.deleteSession);

module.exports = router;