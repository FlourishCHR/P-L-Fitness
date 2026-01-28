const express = require('express');
const router = express.Router();
const ProductCategoryController = require('../controllers/product-category.controller.js');

// DASHBOARD PAGE
router.get("/", ProductCategoryController.getDashboard);

// API ENDPOINTS
router.get("/load", ProductCategoryController.loadCategories);
router.post("/insert", ProductCategoryController.createCategory);
router.put("/update", ProductCategoryController.updateCategory);
router.put("/delete", ProductCategoryController.deleteCategory);

module.exports = router;