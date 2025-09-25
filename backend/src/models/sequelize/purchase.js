module.exports = (sequelize, DataTypes) => {
  const Purchase = sequelize.define('Purchase', {
    purchaseNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    dueDate: {
      type: DataTypes.DATE
    },
    status: {
      type: DataTypes.ENUM('pending', 'received', 'partial', 'cancelled'),
      defaultValue: 'pending'
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    discount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    tax: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    amountPaid: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    notes: {
      type: DataTypes.TEXT
    }
  }, {
    timestamps: true
  });

  return Purchase;
}; 