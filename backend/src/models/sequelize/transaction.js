module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define('Transaction', {
    transactionNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    type: {
      type: DataTypes.ENUM('payment', 'receipt', 'adjustment'),
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    reference: {
      type: DataTypes.STRING
    },
    referenceType: {
      type: DataTypes.ENUM('invoice', 'purchase', 'manual'),
      defaultValue: 'manual'
    },
    referenceId: {
      type: DataTypes.INTEGER
    },
    description: {
      type: DataTypes.TEXT
    },
    paymentMethod: {
      type: DataTypes.ENUM('cash', 'bank', 'card', 'upi', 'other'),
      defaultValue: 'cash'
    }
  }, {
    timestamps: true
  });

  return Transaction;
}; 