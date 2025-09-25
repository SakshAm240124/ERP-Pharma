const { Product } = require('../models/sequelize');
const { sequelize, Op } = require('../../config/sequelize');

/**
 * @desc    Get all products
 * @route   GET /api/products
 * @access  Private
 */
const getProducts = async (req, res) => {
  try {
    const products = await Product.findAll({ 
      order: [['name', 'ASC']] 
    });
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get product by ID
 * @route   GET /api/products/:id
 * @access  Private
 */
const getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Create new product
 * @route   POST /api/products
 * @access  Private
 */
const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update product
 * @route   PUT /api/products/:id
 * @access  Private
 */
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (product) {
      // Update all fields from request body
      await product.update(req.body);
      
      const updatedProduct = await Product.findByPk(req.params.id);
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Delete product
 * @route   DELETE /api/products/:id
 * @access  Private
 */
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (product) {
      await product.destroy();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update product stock
 * @route   PUT /api/products/:id/stock
 * @access  Private
 */
const updateProductStock = async (req, res) => {
  try {
    const { quantity, operation } = req.body;
    
    if (!quantity || !operation) {
      return res.status(400).json({ message: 'Please provide quantity and operation' });
    }
    
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    let newQuantity;
    
    if (operation === 'add') {
      newQuantity = product.stockQuantity + Number(quantity);
    } else if (operation === 'subtract') {
      newQuantity = product.stockQuantity - Number(quantity);
      
      // Check if stock would go below zero
      if (newQuantity < 0) {
        return res.status(400).json({ message: 'Insufficient stock quantity' });
      }
    } else {
      return res.status(400).json({ message: 'Invalid operation. Use "add" or "subtract"' });
    }
    
    // Update stock
    product.stockQuantity = newQuantity;
    await product.save();
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get low stock products
 * @route   GET /api/products/low-stock
 * @access  Private
 */
const getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: {
        stockQuantity: { 
          [Op.lt]: sequelize.col('reorderLevel') 
        },
        isActive: true
      }
    });
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStock,
  getLowStockProducts
}; 