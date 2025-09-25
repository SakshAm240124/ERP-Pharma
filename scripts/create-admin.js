const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../src/models/User');

// Load environment variables
dotenv.config();

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pharma-erp';

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Check if admin already exists
      const adminExists = await User.findOne({ email: 'admin@pharma-erp.com' });
      
      if (adminExists) {
        console.log('Admin user already exists');
      } else {
        // Create admin user
        const admin = await User.create({
          name: 'Administrator',
          email: 'admin@pharma-erp.com',
          password: 'admin123',
          role: 'Administrator',
          status: 'Active'
        });
        
        console.log('Admin user created successfully');
        console.log('Email: admin@pharma-erp.com');
        console.log('Password: admin123');
      }
    } catch (error) {
      console.error('Error creating admin user:', error.message);
    } finally {
      // Disconnect from MongoDB
      mongoose.disconnect();
      console.log('Disconnected from MongoDB');
      process.exit(0);
    }
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }); 