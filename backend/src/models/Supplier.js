const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Supplier name is required'],
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: {
        type: String,
        default: 'India'
      }
    },
    gstin: {
      type: String,
      trim: true
    },
    payable: {
      type: Number,
      default: 0
    },
    creditDays: {
      type: Number,
      default: 30
    }
  },
  {
    timestamps: true
  }
);

const Supplier = mongoose.model('Supplier', supplierSchema);

module.exports = Supplier; 