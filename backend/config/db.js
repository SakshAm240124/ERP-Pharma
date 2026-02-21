import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Client } = pg;

const client = new Client({
  host: "localhost",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: "ERP_PHARMA",
  port: 5432, // default postgres port
});

const dbConnect = async () => {
  try {
    await client.connect();
    console.log("✅ PostgreSQL connected (local)");
  } catch (err) {
    console.error("❌ DB connection error:", err.message);
  }
};

export { dbConnect, client };
