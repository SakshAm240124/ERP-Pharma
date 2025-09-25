const Transaction = require('../models/Transaction');
const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');

/**
 * @desc    Get customer ledger
 * @route   GET /api/transactions/customer/:id
 * @access  Private
 */
exports.getCustomerLedger = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Get start and end date from query params, if provided
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

    // Build query
    const query = { customer: req.params.id };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    const transactions = await Transaction.find(query)
      .populate('invoice', 'invoiceNumber')
      .populate('createdBy', 'name')
      .sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
      customer: {
        id: customer._id,
        name: customer.name,
        outstanding: customer.outstanding
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get supplier ledger
 * @route   GET /api/transactions/supplier/:id
 * @access  Private
 */
exports.getSupplierLedger = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    // Get start and end date from query params, if provided
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

    // Build query
    const query = { supplier: req.params.id };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    const transactions = await Transaction.find(query)
      .populate('purchase', 'purchaseNumber')
      .populate('createdBy', 'name')
      .sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
      supplier: {
        id: supplier._id,
        name: supplier.name,
        payable: supplier.payable
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Create new customer payment transaction
 * @route   POST /api/transactions/customer-payment
 * @access  Private
 */
exports.createCustomerPayment = async (req, res) => {
  try {
    const { customer, amount, date, reference, description } = req.body;

    // Check if customer exists
    const customerExists = await Customer.findById(customer);
    if (!customerExists) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Create transaction
    const transaction = await Transaction.create({
      type: 'Payment',
      amount,
      date: date || Date.now(),
      reference,
      description,
      customer,
      createdBy: req.user._id
    });

    // Update customer outstanding
    await Customer.findByIdAndUpdate(customer, {
      $inc: { outstanding: -amount }
    });

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Create new supplier payment transaction
 * @route   POST /api/transactions/supplier-payment
 * @access  Private
 */
exports.createSupplierPayment = async (req, res) => {
  try {
    const { supplier, amount, date, reference, description } = req.body;

    // Check if supplier exists
    const supplierExists = await Supplier.findById(supplier);
    if (!supplierExists) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    // Create transaction
    const transaction = await Transaction.create({
      type: 'Receipt',
      amount,
      date: date || Date.now(),
      reference,
      description,
      supplier,
      createdBy: req.user._id
    });

    // Update supplier payable
    await Supplier.findByIdAndUpdate(supplier, {
      $inc: { payable: -amount }
    });

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Delete transaction
 * @route   DELETE /api/transactions/:id
 * @access  Private (Admin only)
 */
exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Reverse the effect of the transaction
    if (transaction.type === 'Payment' && transaction.customer) {
      // If it was a customer payment, increase outstanding
      await Customer.findByIdAndUpdate(transaction.customer, {
        $inc: { outstanding: transaction.amount }
      });
    } else if (transaction.type === 'Receipt' && transaction.supplier) {
      // If it was a supplier payment, increase payable
      await Supplier.findByIdAndUpdate(transaction.supplier, {
        $inc: { payable: transaction.amount }
      });
    }

    await Transaction.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 