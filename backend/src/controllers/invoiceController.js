const Invoice = require('../models/Invoice');
const Customer = require('../models/Customer');
const Product = require('../models/Product');

/**
 * @desc    Get all invoices
 * @route   GET /api/invoices
 * @access  Private
 */
exports.getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate('customer', 'name email')
      .populate('items.product', 'name sku price');

    res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get invoice by ID
 * @route   GET /api/invoices/:id
 * @access  Private
 */
exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customer', 'name email phone address gstin')
      .populate('items.product', 'name sku price unit');
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    res.status(200).json({
      success: true,
      data: invoice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Create new invoice
 * @route   POST /api/invoices
 * @access  Private
 */
exports.createInvoice = async (req, res) => {
  try {
    const { 
      invoiceNumber, 
      customer, 
      date, 
      dueDate, 
      items, 
      paymentType,
      notes 
    } = req.body;

    // Check if invoice number already exists
    const existingInvoice = await Invoice.findOne({ invoiceNumber });
    if (existingInvoice) {
      return res.status(400).json({
        success: false,
        message: 'Invoice with this number already exists'
      });
    }

    // Check if customer exists
    const customerExists = await Customer.findById(customer);
    if (!customerExists) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Validate items and calculate totals
    let subTotal = 0;
    let taxTotal = 0;
    let discountTotal = 0;

    // Process each item
    for (const item of items) {
      // Check if product exists
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product}`
        });
      }

      // Check if sufficient stock is available
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product: ${product.name}`
        });
      }

      // Calculate item total
      const itemPrice = item.price || product.price;
      const itemQuantity = item.quantity;
      const itemDiscount = item.discount || 0;
      const itemTaxPercent = item.tax || product.taxPercentage;
      
      const itemSubtotal = itemPrice * itemQuantity;
      const itemTaxAmount = (itemSubtotal - itemDiscount) * (itemTaxPercent / 100);
      
      // Update totals
      subTotal += itemSubtotal;
      taxTotal += itemTaxAmount;
      discountTotal += itemDiscount;

      // Prepare tax breakdown if needed
      item.tax = itemTaxAmount;
      item.total = itemSubtotal + itemTaxAmount - itemDiscount;

      // Update product stock
      await Product.findByIdAndUpdate(product._id, {
        $inc: { stock: -itemQuantity }
      });
    }

    // Calculate grand total
    const grandTotal = subTotal + taxTotal - discountTotal;

    // If credit payment, update customer outstanding
    if (paymentType === 'Credit') {
      // Check credit limit
      if (customerExists.creditLimit > 0 && 
          (customerExists.outstanding + grandTotal) > customerExists.creditLimit) {
        return res.status(400).json({
          success: false,
          message: 'This invoice would exceed customer credit limit'
        });
      }

      // Update customer outstanding
      await Customer.findByIdAndUpdate(customer, {
        $inc: { outstanding: grandTotal }
      });
    }

    // Create invoice
    const invoice = await Invoice.create({
      invoiceNumber,
      customer,
      date: date || Date.now(),
      dueDate,
      items,
      subTotal,
      taxTotal,
      discountTotal,
      grandTotal,
      paymentType: paymentType || 'Cash',
      notes
    });

    // Populate customer and product details for response
    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate('customer', 'name')
      .populate('items.product', 'name');

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: populatedInvoice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Update invoice status
 * @route   PUT /api/invoices/:id/status
 * @access  Private
 */
exports.updateInvoiceStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['Paid', 'Pending', 'Overdue'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid status (Paid, Pending, Overdue)'
      });
    }

    const invoice = await Invoice.findById(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // If changing from Credit to Paid, update customer outstanding
    if (invoice.paymentType === 'Credit' && 
        invoice.status !== 'Paid' && 
        status === 'Paid') {
      await Customer.findByIdAndUpdate(invoice.customer, {
        $inc: { outstanding: -invoice.grandTotal }
      });
    }

    // Update invoice status
    invoice.status = status;
    await invoice.save();

    res.status(200).json({
      success: true,
      message: 'Invoice status updated successfully',
      data: invoice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Delete invoice
 * @route   DELETE /api/invoices/:id
 * @access  Private
 */
exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // If credit invoice and not paid, reduce customer outstanding
    if (invoice.paymentType === 'Credit' && invoice.status !== 'Paid') {
      await Customer.findByIdAndUpdate(invoice.customer, {
        $inc: { outstanding: -invoice.grandTotal }
      });
    }

    // Restore product stock
    for (const item of invoice.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity }
      });
    }

    await Invoice.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Invoice deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 