const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['Invoice', 'Payment', 'Purchase', 'Receipt'],
      required: [true, 'Transaction type is required']
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required']
    },
    reference: {
      type: String,
      required: [true, 'Reference is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer'
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier'
    },
    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice'
    },
    purchase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Purchase'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by is required']
    }
  },
  {
    timestamps: true
  }
);

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction; 