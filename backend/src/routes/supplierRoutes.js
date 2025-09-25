const express = require('express');
const router = express.Router();
const {
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
  getSupplierLedger,
  getOutstandingSuppliers
} = require('../controllers/supplierController');
const { protect, admin } = require('../middleware/authMiddleware');

// Get all suppliers
router.route('/')
  .get(protect, getSuppliers)
  .post(protect, createSupplier);

// Get suppliers with outstanding balance
router.get('/outstanding', protect, getOutstandingSuppliers);

// Get, update, and delete single supplier
router.route('/:id')
  .get(protect, getSupplierById)
  .put(protect, updateSupplier)
  .delete(protect, admin, deleteSupplier);

// Get supplier ledger
router.get('/:id/ledger', protect, getSupplierLedger);

module.exports = router; 