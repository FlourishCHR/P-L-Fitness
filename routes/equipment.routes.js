const express = require('express');
const router = express.Router();
const EquipmentController = require('../controllers/equipment.controller');

// DASHBOARD PAGE
router.get("/", EquipmentController.getDashboard);

// API ENDPOINTS
router.get("/load", EquipmentController.loadEquipment);
router.post("/insert", EquipmentController.createEquipment);
router.put("/update", EquipmentController.updateEquipment);
router.put("/delete", EquipmentController.deleteEquipment);

module.exports = router;