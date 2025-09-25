const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Get customer and supplier ledger
router.get('/customer/:id', transactionController.getCustomerLedger);
router.get('/supplier/:id', transactionController.getSupplierLedger);

// Create payments
router.post('/customer-payment', transactionController.createCustomerPayment);
router.post('/supplier-payment', transactionController.createSupplierPayment);

// Delete transaction (admin only)
router.delete('/:id', authorize('Administrator'), transactionController.deleteTransaction);

module.exports = router; 