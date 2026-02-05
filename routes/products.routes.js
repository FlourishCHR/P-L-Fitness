const express = require('express');
const router = express.Router();
const ProductsController = require('../controllers/products.controller.js');

// DASHBOARD PAGE
router.get("/", ProductsController.getDashboard);

// API ENDPOINTS
router.get("/load", ProductsController.loadProducts);
router.post("/insert", ProductsController.createProduct);
router.put("/update", ProductsController.updateProduct);
router.put("/delete", ProductsController.deleteProduct);
router.post("/sale", ProductsController.createProductSale);

module.exports = router;