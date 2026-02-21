const { Invoice, Customer, Product, InvoiceItem } = require('../models/sequelize');

/**
 * Get all invoices
 */
exports.getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.findAll({
      include: [
        { model: Customer },
        {
          model: InvoiceItem,
          include: [Product]
        }
      ]
    });

    res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


/**
 * Get invoice by ID
 */
exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id, {
      include: [
        { model: Customer },
        {
          model: InvoiceItem,
          include: [Product]
        }
      ]
    });

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


/**
 * Create invoice
 */
exports.createInvoice = async (req, res) => {
  try {
    const { invoiceNumber, customerId, items, paymentType, notes } = req.body;

    const existingInvoice = await Invoice.findOne({ where: { invoiceNumber } });
    if (existingInvoice) {
      return res.status(400).json({ success: false, message: 'Invoice already exists' });
    }

    const customer = await Customer.findByPk(customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    let subTotal = 0;

    const invoice = await Invoice.create({
      invoiceNumber,
      customerId,
      paymentType: paymentType || 'Cash',
      notes
    });

    for (const item of items) {
      const product = await Product.findByPk(item.productId);

      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({ success: false, message: 'Insufficient stock' });
      }

      const total = product.price * item.quantity;
      subTotal += total;

      await InvoiceItem.create({
        invoiceId: invoice.id,
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
        total
      });

      await product.update({
        stockQuantity: product.stockQuantity - item.quantity
      });
    }

    await invoice.update({
      subTotal,
      grandTotal: subTotal
    });

    const fullInvoice = await Invoice.findByPk(invoice.id, {
      include: [
        { model: Customer },
        { model: InvoiceItem, include: [Product] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: fullInvoice
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


/**
 * Delete invoice
 */
exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id);

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    await InvoiceItem.destroy({ where: { invoiceId: invoice.id } });
    await invoice.destroy();

    res.status(200).json({ success: true, message: 'Invoice deleted' });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};