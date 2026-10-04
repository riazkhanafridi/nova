import express from "express";
import {
  getAllBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
} from "../controller/brandController.js";
import auth from "../middlewares/Auth.js";
import roleAuthorization from "../middlewares/roleAuthorization.js";
import { setUploadFolder, upload } from "../middlewares/upload.js";
import { USER_ROLES } from "../config/constants.js";

const router = express.Router();

// Public routes
router.get("/", getAllBrands);
router.get("/:brandId", getBrandById);

// Admin only routes
router.use(auth, roleAuthorization([USER_ROLES.admin]));
router.post("/", setUploadFolder("brands"), upload.single("logo"), createBrand);
router.patch("/:brandId", setUploadFolder("brands"), upload.single("logo"), updateBrand);
router.delete("/:brandId", deleteBrand);

export default router;
