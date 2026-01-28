const express = require('express');
const router = express.Router();
const AchievementsController = require('../controllers/achievements.controller.js');

// DASHBOARD PAGE
router.get("/", AchievementsController.getDashboard);

// API ENDPOINTS
router.get("/load", AchievementsController.loadAchievements);
router.post("/insert", AchievementsController.createAchievement);
router.put("/update", AchievementsController.updateAchievement);
router.put("/delete", AchievementsController.deleteAchievement);
router.get("/user", AchievementsController.getUserAchievements);
router.post("/check", AchievementsController.checkAchievements);


module.exports = router;