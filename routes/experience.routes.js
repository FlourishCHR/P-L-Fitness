const express = require('express');
const router = express.Router();
const ExperienceController = require('../controllers/experience.controller.js');

// API ENDPOINTS
router.get("/:userId?", ExperienceController.getUserExperience);
router.post("/add", ExperienceController.addExperience);
router.get("/leaderboard", ExperienceController.getLeaderboards);

module.exports = router;