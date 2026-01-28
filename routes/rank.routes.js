const express = require('express');
const router = express.Router();
const RankController = require('../controllers/rank.controller');

// DASHBOARD PAGE
router.get("/", RankController.getDashboard);

// API ENDPOINTS
router.get("/load", RankController.loadRanks);
router.post("/insert", RankController.createRank);
router.put("/update", RankController.updateRank);
router.put("/delete", RankController.deleteRank);

module.exports = router;