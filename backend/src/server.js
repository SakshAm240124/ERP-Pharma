require('dotenv').config();  // ✅ Load env variables first

const express = require('express');
const cors = require('cors');

const { sequelize, syncDatabase } = require('./models/sequelize');

const app = express();

// ✅ Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/suppliers', require('./routes/supplierRoutes'));
app.use('/api/invoices', require('./routes/invoiceRoutes'));
app.use('/api/purchases', require('./routes/purchaseRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));

// ✅ Health route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Pharma ERP API' });
});

const PORT = process.env.PORT || 5000;

// ✅ Start Server
const startServer = async () => {
  try {
    console.log("🔄 Starting server...");

    console.log("⏳ Connecting to database...");
    await sequelize.authenticate();   // test connection
    console.log("✅ Database connected successfully!");

    console.log("⏳ Syncing database models...");
    await syncDatabase();             // sync tables
    console.log("✅ Database synced successfully!");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();