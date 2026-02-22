const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Basic CRUD routes
router.get('/', purchaseController.getPurchases);
router.get('/:id', purchaseController.getPurchaseById);
router.post('/', purchaseController.createPurchase);
router.delete('/:id', purchaseController.deletePurchase);

// Update status route

module.exports = router; 