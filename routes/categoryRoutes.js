import express from "express";
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controller/categoryController.js";
import auth from "../middlewares/Auth.js";
import roleAuthorization from "../middlewares/roleAuthorization.js";
import { setUploadFolder, upload } from "../middlewares/upload.js";
import { USER_ROLES } from "../config/constants.js";

const router = express.Router();

// Public routes
router.get("/", getAllCategories);
router.get("/:categoryId", getCategoryById);

// Admin only routes
router.use(auth, roleAuthorization([USER_ROLES.admin]));
router.post("/", setUploadFolder("categories"), upload.single("image"), createCategory);
router.patch("/:categoryId", setUploadFolder("categories"), upload.single("image"), updateCategory);
router.delete("/:categoryId", deleteCategory);

export default router;
