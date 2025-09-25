const Purchase = require('../models/Purchase');
const Supplier = require('../models/Supplier');
const Product = require('../models/Product');

/**
 * @desc    Get all purchases
 * @route   GET /api/purchases
 * @access  Private
 */
exports.getPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find()
      .populate('supplier', 'name email')
      .populate('items.product', 'name sku price');

    res.status(200).json({
      success: true,
      count: purchases.length,
      data: purchases
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get purchase by ID
 * @route   GET /api/purchases/:id
 * @access  Private
 */
exports.getPurchaseById = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate('supplier', 'name email phone address gstin')
      .populate('items.product', 'name sku price unit');
    
    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found'
      });
    }

    res.status(200).json({
      success: true,
      data: purchase
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Create new purchase
 * @route   POST /api/purchases
 * @access  Private
 */
exports.createPurchase = async (req, res) => {
  try {
    const { 
      purchaseNumber, 
      supplier, 
      date, 
      dueDate, 
      items, 
      notes 
    } = req.body;

    // Check if purchase number already exists
    const existingPurchase = await Purchase.findOne({ purchaseNumber });
    if (existingPurchase) {
      return res.status(400).json({
        success: false,
        message: 'Purchase with this number already exists'
      });
    }

    // Check if supplier exists
    const supplierExists = await Supplier.findById(supplier);
    if (!supplierExists) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
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
        $inc: { 
          stock: itemQuantity,
          value: itemQuantity * product.price
        }
      });
    }

    // Calculate grand total
    const grandTotal = subTotal + taxTotal - discountTotal;

    // Update supplier payable
    await Supplier.findByIdAndUpdate(supplier, {
      $inc: { payable: grandTotal }
    });

    // Create purchase
    const purchase = await Purchase.create({
      purchaseNumber,
      supplier,
      date: date || Date.now(),
      dueDate,
      items,
      subTotal,
      taxTotal,
      discountTotal,
      grandTotal,
      notes
    });

    // Populate supplier and product details for response
    const populatedPurchase = await Purchase.findById(purchase._id)
      .populate('supplier', 'name')
      .populate('items.product', 'name');

    res.status(201).json({
      success: true,
      message: 'Purchase created successfully',
      data: populatedPurchase
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Update purchase status
 * @route   PUT /api/purchases/:id/status
 * @access  Private
 */
exports.updatePurchaseStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['Completed', 'Pending', 'Cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid status (Completed, Pending, Cancelled)'
      });
    }

    const purchase = await Purchase.findById(req.params.id);
    
    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found'
      });
    }

    // If status is changing to Completed and was not previously Completed
    if (status === 'Completed' && purchase.status !== 'Completed') {
      // No action needed as payable was already increased and stock was already updated
    }

    // If status is changing to Cancelled
    if (status === 'Cancelled' && purchase.status !== 'Cancelled') {
      // Reduce supplier payable
      await Supplier.findByIdAndUpdate(purchase.supplier, {
        $inc: { payable: -purchase.grandTotal }
      });

      // Reduce product stock for each item
      for (const item of purchase.items) {
        const product = await Product.findById(item.product);
        if (product) {
          // Only reduce stock if there's enough
          const newStock = Math.max(0, product.stock - item.quantity);
          await Product.findByIdAndUpdate(product._id, {
            stock: newStock,
            value: newStock * product.price
          });
        }
      }
    }

    // Update purchase status
    purchase.status = status;
    await purchase.save();

    res.status(200).json({
      success: true,
      message: 'Purchase status updated successfully',
      data: purchase
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Delete purchase
 * @route   DELETE /api/purchases/:id
 * @access  Private
 */
exports.deletePurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    
    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found'
      });
    }

    // If purchase is not cancelled, reduce supplier payable
    if (purchase.status !== 'Cancelled') {
      await Supplier.findByIdAndUpdate(purchase.supplier, {
        $inc: { payable: -purchase.grandTotal }
      });
    }

    // If purchase is not cancelled, reduce product stock
    if (purchase.status !== 'Cancelled') {
      for (const item of purchase.items) {
        const product = await Product.findById(item.product);
        if (product) {
          // Only reduce stock if there's enough
          const newStock = Math.max(0, product.stock - item.quantity);
          await Product.findByIdAndUpdate(product._id, {
            stock: newStock,
            value: newStock * product.price
          });
        }
      }
    }

    await Purchase.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Purchase deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 