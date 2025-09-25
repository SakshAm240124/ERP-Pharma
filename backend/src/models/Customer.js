const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
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
    outstanding: {
      type: Number,
      default: 0
    },
    creditLimit: {
      type: Number,
      default: 0
    },
    dueDays: {
      type: Number,
      default: 30
    }
  },
  {
    timestamps: true
  }
);

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer; 