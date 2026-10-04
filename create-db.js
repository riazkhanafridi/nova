import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const createDatabase = async () => {
  try {
    console.log("Connecting to MySQL to verify/create database...");
    const connection = await mysql.createConnection({
      host: process.env.DB_HOSTNAME || "localhost",
      user: process.env.DB_USERNAME || "root",
      password: process.env.DB_PASSWORD || "",
      port: process.env.DB_PORT || 3306,
    });

    const dbName = process.env.DB_NAME || "nova_db";
    
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    console.log(`✅ Database '${dbName}' verified/created successfully.`);
    
    await connection.end();
  } catch (error) {
    console.error("❌ Error creating database. Is MySQL running?");
    console.error(error.message);
    process.exit(1);
  }
};

createDatabase();
