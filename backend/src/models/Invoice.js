const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: [true, 'Invoice number is required'],
      unique: true,
      trim: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer is required']
    },
    date: {
      type: Date,
      default: Date.now
    },
    dueDate: {
      type: Date
    },
    status: {
      type: String,
      enum: ['Paid', 'Pending', 'Overdue'],
      default: 'Pending'
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: [true, 'Product is required']
        },
        quantity: {
          type: Number,
          required: [true, 'Quantity is required'],
          min: [1, 'Quantity must be at least 1']
        },
        price: {
          type: Number,
          required: [true, 'Price is required']
        },
        discount: {
          type: Number,
          default: 0
        },
        tax: {
          type: Number,
          default: 0
        },
        cgst: {
          type: Number,
          default: 0
        },
        sgst: {
          type: Number,
          default: 0
        },
        igst: {
          type: Number,
          default: 0
        },
        total: {
          type: Number,
          required: [true, 'Total is required']
        }
      }
    ],
    subTotal: {
      type: Number,
      required: [true, 'Subtotal is required']
    },
    taxTotal: {
      type: Number,
      default: 0
    },
    discountTotal: {
      type: Number,
      default: 0
    },
    grandTotal: {
      type: Number,
      required: [true, 'Grand total is required']
    },
    paymentType: {
      type: String,
      enum: ['Cash', 'Credit'],
      default: 'Cash'
    },
    notes: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Add pre-save hook to calculate totals
invoiceSchema.pre('save', function(next) {
  // Calculate subtotal, tax total, and grand total based on items
  let subTotal = 0;
  let taxTotal = 0;
  let discountTotal = 0;

  if (this.items && this.items.length > 0) {
    this.items.forEach(item => {
      subTotal += item.price * item.quantity;
      taxTotal += item.tax;
      discountTotal += item.discount;
    });
  }

  this.subTotal = subTotal;
  this.taxTotal = taxTotal;
  this.discountTotal = discountTotal;
  this.grandTotal = subTotal + taxTotal - discountTotal;

  next();
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice; 