const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateProductStock,
  getLowStockProducts
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

// Get all products
router.route('/')
  .get(protect, getProducts)
  .post(protect, admin, createProduct);

// Get low stock products
router.get('/low-stock', protect, getLowStockProducts);

// Get, update, and delete single product
router.route('/:id')
  .get(protect, getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

// Update product stock
router.put('/:id/stock', protect, updateProductStock);

module.exports = router; 