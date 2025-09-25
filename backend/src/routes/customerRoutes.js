const express = require('express');
const router = express.Router();
const {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  getCustomerLedger,
  getOutstandingCustomers
} = require('../controllers/customerController');
const { protect, admin } = require('../middleware/authMiddleware');

// Get all customers and outstanding customers
router.route('/')
  .get(protect, getCustomers)
  .post(protect, createCustomer);

// Get customers with outstanding balance
router.get('/outstanding', protect, getOutstandingCustomers);

// Get, update, and delete single customer
router.route('/:id')
  .get(protect, getCustomerById)
  .put(protect, updateCustomer)
  .delete(protect, admin, deleteCustomer);

// Get customer ledger
router.get('/:id/ledger', protect, getCustomerLedger);

module.exports = router; 