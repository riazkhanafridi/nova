import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logError = (err) => {
  const logPath = path.join(__dirname, "../error.log");
  const logEntry = `[${new Date().toISOString()}] ${err.statusCode || 500} - ${err.message}\n${err.stack || ""}\n\n`;
  fs.appendFile(logPath, logEntry, () => {});
};

export default logError;
