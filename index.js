import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";

import dbConnection from "./config/dbConnect.js";
import dbInit from "./config/dbInit.js";
import setupAssociations from "./config/associations.js";
import router from "./routes/index.js";
import ErrorMiddleware from "./middlewares/Error.js";
import envVariables from "./config/constants.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const { appPort } = envVariables;

const allowedUrls = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
];

const corsOption = {
  origin: allowedUrls,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
};

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(cors(corsOption));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/v1", router);

// Global error middleware
app.use(ErrorMiddleware);

app.listen(appPort, async () => {
  console.log(`🚀 NOVA Server running on port ${appPort}`);
  await dbConnection();
  setupAssociations();
  await dbInit();
});
