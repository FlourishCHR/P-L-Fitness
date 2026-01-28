const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const AuthController = require('../controllers/auth.controller');

// DASHBOARD PAGE
router.get("/", AuthController.getDashboard);

// API ENDPOINTS
router.post("/login", AuthController.login);
router.post('/refresh', AuthController.refresh);
router.post('/logout', auth, AuthController.logout);
router.post('/register', AuthController.register);

module.exports = router;