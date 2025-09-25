const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      trim: true
    },
    hsn: {
      type: String,
      trim: true
    },
    stock: {
      type: Number,
      default: 0
    },
    minStock: {
      type: Number,
      default: 0
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      trim: true
    },
    value: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'Price is required']
    },
    taxPercentage: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['In Stock', 'Low Stock', 'Out of Stock'],
      default: 'In Stock'
    }
  },
  {
    timestamps: true
  }
);

// Middleware to update status based on stock and minStock
productSchema.pre('save', function(next) {
  if (this.stock === 0) {
    this.status = 'Out of Stock';
  } else if (this.stock < this.minStock) {
    this.status = 'Low Stock';
  } else {
    this.status = 'In Stock';
  }
  next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product; 