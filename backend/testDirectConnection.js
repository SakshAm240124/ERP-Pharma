require('dotenv').config({ path: __dirname + '/.env' });
const { Sequelize } = require('sequelize');

console.log("✅ .env file loaded");

console.log("\n🔍 Checking Environment Variables:");
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD);
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_PORT:", process.env.DB_PORT);

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false
  }
);

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("\n✅ PostgreSQL Connected Successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Connection Failed:", error.message);
    process.exit(1);
  }
}

testConnection();
