const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Basic CRUD routes
router.get('/', invoiceController.getInvoices);
router.get('/:id', invoiceController.getInvoiceById);
router.post('/', invoiceController.createInvoice);
router.delete('/:id', invoiceController.deleteInvoice);

// Update status route
router.put('/:id/status', invoiceController.updateInvoiceStatus);

module.exports = router; 