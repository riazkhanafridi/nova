import { Sequelize } from "sequelize";
import envVariables from "./constants.js";

const { dbUserName, dbPassword, dbHostName, dbName, dbPort } = envVariables;

export const sequelize = new Sequelize(dbName, dbUserName, dbPassword, {
  host: dbHostName || "127.0.0.1",
  port: Number(dbPort || 3306),
  dialect: "mysql",
  logging: false,
  dialectOptions: {
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  },
});

const dbConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.");
  } catch (error) {
    console.error("❌ MySQL connection failed.");
    console.error("Please start MySQL/MariaDB and verify the values in [.env](.env) for DB_HOSTNAME, DB_PORT, DB_USERNAME, DB_PASSWORD and DB_NAME.");
    console.error("Connection details attempted:", {
      host: dbHostName || "127.0.0.1",
      port: Number(dbPort || 3306),
      database: dbName,
      username: dbUserName,
    });
    console.error(error.message);
    process.exit(1);
  }
};

export default dbConnection;
