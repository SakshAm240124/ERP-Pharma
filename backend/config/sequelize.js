const { Sequelize, Op, DataTypes } = require('sequelize');
require('dotenv').config();

// Hardcoded values for now
const sequelize = new Sequelize('pharma_erp', 'postgres', '9835', {
  host: 'localhost',
  port: 5432,
  dialect: 'postgres',
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL connection established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, Op, DataTypes, connectDB }; 