const { Transaction, Customer, Supplier, Invoice, Purchase, User } = require('../models/sequelize');
const { Op } = require('../../config/sequelize');

/**
 * Get customer ledger
 */
exports.getCustomerLedger = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const transactions = await Transaction.findAll({
      where: { customerId: req.params.id },
      order: [['date', 'ASC']],
      include: [
        { model: Invoice },
        { model: User, as: 'createdByUser' }
      ]
    });

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
      customer
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


/**
 * Get supplier ledger
 */
exports.getSupplierLedger = async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);

    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    const transactions = await Transaction.findAll({
      where: { supplierId: req.params.id },
      order: [['date', 'ASC']],
      include: [
        { model: Purchase },
        { model: User, as: 'createdByUser' }
      ]
    });

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
      supplier
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


/**
 * Create customer payment
 */
exports.createCustomerPayment = async (req, res) => {
  try {
    const { customerId, amount, reference, description } = req.body;

    const customer = await Customer.findByPk(customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const transaction = await Transaction.create({
      type: 'Payment',
      amount,
      reference,
      description,
      customerId,
      createdBy: req.user.id
    });

    await customer.update({
      outstanding: customer.outstanding - amount
    });

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: transaction
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


/**
 * Create supplier payment
 */
exports.createSupplierPayment = async (req, res) => {
  try {
    const { supplierId, amount, reference, description } = req.body;

    const supplier = await Supplier.findByPk(supplierId);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    const transaction = await Transaction.create({
      type: 'Receipt',
      amount,
      reference,
      description,
      supplierId,
      createdBy: req.user.id
    });

    await supplier.update({
      payable: supplier.payable - amount
    });

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: transaction
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


/**
 * Delete transaction
 */
exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id);

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    await transaction.destroy();

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully'
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};