const { sequelize, DataTypes } = require('../../config/config');
// Import models
const User = require('./user')(sequelize, DataTypes);
const Product = require('./product')(sequelize, DataTypes);
const Customer = require('./customer')(sequelize, DataTypes);
const Supplier = require('./supplier')(sequelize, DataTypes);
const Invoice = require('./invoice')(sequelize, DataTypes);
const InvoiceItem = require('./invoiceItem')(sequelize, DataTypes);
const Purchase = require('./purchase')(sequelize, DataTypes);
const PurchaseItem = require('./purchaseItem')(sequelize, DataTypes);
const Transaction = require('./transaction')(sequelize, DataTypes);

// Define associations
User.hasMany(Invoice, { foreignKey: 'userId' });
Invoice.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Purchase, { foreignKey: 'userId' });
Purchase.belongsTo(User, { foreignKey: 'userId' });

Customer.hasMany(Invoice, { foreignKey: 'customerId' });
Invoice.belongsTo(Customer, { foreignKey: 'customerId' });

Supplier.hasMany(Purchase, { foreignKey: 'supplierId' });
Purchase.belongsTo(Supplier, { foreignKey: 'supplierId' });

Invoice.hasMany(InvoiceItem, { foreignKey: 'invoiceId' });
InvoiceItem.belongsTo(Invoice, { foreignKey: 'invoiceId' });

Purchase.hasMany(PurchaseItem, { foreignKey: 'purchaseId' });
PurchaseItem.belongsTo(Purchase, { foreignKey: 'purchaseId' });

Product.hasMany(InvoiceItem, { foreignKey: 'productId' });
InvoiceItem.belongsTo(Product, { foreignKey: 'productId' });

Product.hasMany(PurchaseItem, { foreignKey: 'productId' });
PurchaseItem.belongsTo(Product, { foreignKey: 'productId' });

Customer.hasMany(Transaction, { foreignKey: 'customerId' });
Transaction.belongsTo(Customer, { foreignKey: 'customerId' });

Supplier.hasMany(Transaction, { foreignKey: 'supplierId' });
Transaction.belongsTo(Supplier, { foreignKey: 'supplierId' });

// Sync all models with database
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database & tables synced');
  } catch (error) {
    console.error('Error syncing database:', error);
  }
};

module.exports = {
  sequelize,
  syncDatabase,
  User,
  Product,
  Customer,
  Supplier,
  Invoice,
  InvoiceItem,
  Purchase,
  PurchaseItem,
  Transaction
}; 