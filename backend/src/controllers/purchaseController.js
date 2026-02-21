const { Purchase, Supplier, Product, PurchaseItem } = require('../models/sequelize');

/**
 * Get all purchases
 */
exports.getPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.findAll({
      include: [
        { model: Supplier },
        { model: PurchaseItem, include: [Product] }
      ]
    });

    res.status(200).json({
      success: true,
      count: purchases.length,
      data: purchases
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


/**
 * Get purchase by ID
 */
exports.getPurchaseById = async (req, res) => {
  try {
    const purchase = await Purchase.findByPk(req.params.id, {
      include: [
        { model: Supplier },
        { model: PurchaseItem, include: [Product] }
      ]
    });

    if (!purchase) {
      return res.status(404).json({ success: false, message: 'Purchase not found' });
    }

    res.status(200).json({ success: true, data: purchase });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


/**
 * Create purchase
 */
exports.createPurchase = async (req, res) => {
  try {
    const { purchaseNumber, supplierId, items } = req.body;

    const supplier = await Supplier.findByPk(supplierId);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    const purchase = await Purchase.create({
      purchaseNumber,
      supplierId
    });

    let totalAmount = 0;

    for (const item of items) {
      const product = await Product.findByPk(item.productId);

      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      const total = product.price * item.quantity;
      totalAmount += total;

      await PurchaseItem.create({
        purchaseId: purchase.id,
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
        total
      });

      await product.update({
        stockQuantity: product.stockQuantity + item.quantity
      });
    }

    await purchase.update({
      grandTotal: totalAmount
    });

    const fullPurchase = await Purchase.findByPk(purchase.id, {
      include: [
        { model: Supplier },
        { model: PurchaseItem, include: [Product] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Purchase created successfully',
      data: fullPurchase
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


/**
 * Delete purchase
 */
exports.deletePurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findByPk(req.params.id);

    if (!purchase) {
      return res.status(404).json({ success: false, message: 'Purchase not found' });
    }

    await PurchaseItem.destroy({ where: { purchaseId: purchase.id } });
    await purchase.destroy();

    res.status(200).json({ success: true, message: 'Purchase deleted successfully' });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};