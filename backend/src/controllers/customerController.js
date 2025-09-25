const { Customer, Transaction } = require('../models/sequelize');
const { Op } = require('../../config/sequelize');

/**
 * @desc    Get all customers
 * @route   GET /api/customers
 * @access  Private
 */
const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.findAll({
      order: [['name', 'ASC']]
    });
    
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get customer by ID
 * @route   GET /api/customers/:id
 * @access  Private
 */
const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    
    if (customer) {
      res.json(customer);
    } else {
      res.status(404).json({ message: 'Customer not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Create new customer
 * @route   POST /api/customers
 * @access  Private
 */
const createCustomer = async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    
    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update customer
 * @route   PUT /api/customers/:id
 * @access  Private
 */
const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    
    if (customer) {
      await customer.update(req.body);
      
      const updatedCustomer = await Customer.findByPk(req.params.id);
      res.json(updatedCustomer);
    } else {
      res.status(404).json({ message: 'Customer not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Delete customer
 * @route   DELETE /api/customers/:id
 * @access  Private
 */
const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    
    if (customer) {
      await customer.destroy();
      res.json({ message: 'Customer removed' });
    } else {
      res.status(404).json({ message: 'Customer not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get customer ledger
 * @route   GET /api/customers/:id/ledger
 * @access  Private
 */
const getCustomerLedger = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    const transactions = await Transaction.findAll({
      where: { 
        customerId: req.params.id 
      },
      order: [['date', 'DESC']]
    });
    
    res.json({
      customer,
      transactions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get customers with outstanding balance
 * @route   GET /api/customers/outstanding
 * @access  Private
 */
const getOutstandingCustomers = async (req, res) => {
  try {
    const customers = await Customer.findAll({
      where: {
        currentBalance: {
          [Op.gt]: 0
        }
      },
      order: [['currentBalance', 'DESC']]
    });
    
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerLedger,
  getOutstandingCustomers
}; 