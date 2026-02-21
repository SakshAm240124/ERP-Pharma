const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { dbConnect } = require('../config/db');
const { syncDatabase } = require('./models/sequelize');

// Create Express app
const app = express();

// ✅ CORS (for deployment)
// For now allow all origins
app.use(cors({
  origin: "*"
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const customerRoutes = require('./routes/customerRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

// Route middleware
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/transactions', transactionRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Pharma ERP API' });
});

// Port
const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
  try {
    console.log("🔄 Starting server...");

    console.log("⏳ Connecting to database...");
    await dbConnect();
    console.log("✅ Database connected successfully!");

    console.log("⏳ Syncing database models...");
    await syncDatabase();
    console.log("✅ Database synced successfully!");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
