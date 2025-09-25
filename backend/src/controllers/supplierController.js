const { Supplier, Transaction } = require('../models/sequelize');
const { Op } = require('../../config/sequelize');

/**
 * @desc    Get all suppliers
 * @route   GET /api/suppliers
 * @access  Private
 */
const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.findAll({
      order: [['name', 'ASC']]
    });
    
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get supplier by ID
 * @route   GET /api/suppliers/:id
 * @access  Private
 */
const getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    
    if (supplier) {
      res.json(supplier);
    } else {
      res.status(404).json({ message: 'Supplier not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Create new supplier
 * @route   POST /api/suppliers
 * @access  Private
 */
const createSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);
    
    res.status(201).json(supplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update supplier
 * @route   PUT /api/suppliers/:id
 * @access  Private
 */
const updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    
    if (supplier) {
      await supplier.update(req.body);
      
      const updatedSupplier = await Supplier.findByPk(req.params.id);
      res.json(updatedSupplier);
    } else {
      res.status(404).json({ message: 'Supplier not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Delete supplier
 * @route   DELETE /api/suppliers/:id
 * @access  Private
 */
const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    
    if (supplier) {
      await supplier.destroy();
      res.json({ message: 'Supplier removed' });
    } else {
      res.status(404).json({ message: 'Supplier not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get supplier ledger
 * @route   GET /api/suppliers/:id/ledger
 * @access  Private
 */
const getSupplierLedger = async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    
    const transactions = await Transaction.findAll({
      where: { 
        supplierId: req.params.id 
      },
      order: [['date', 'DESC']]
    });
    
    res.json({
      supplier,
      transactions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get suppliers with outstanding balance
 * @route   GET /api/suppliers/outstanding
 * @access  Private
 */
const getOutstandingSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.findAll({
      where: {
        currentBalance: {
          [Op.gt]: 0
        }
      },
      order: [['currentBalance', 'DESC']]
    });
    
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getSupplierLedger,
  getOutstandingSuppliers
}; 