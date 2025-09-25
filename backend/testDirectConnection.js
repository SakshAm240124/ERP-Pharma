const { Sequelize } = require('sequelize');

// Create a direct connection with hardcoded values
const sequelize = new Sequelize('pharma_erp', 'postgres', '9835', {
  host: 'localhost',
  port: 5432,
  dialect: 'postgres',
  logging: console.log
});

// Test the connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
}

testConnection(); 