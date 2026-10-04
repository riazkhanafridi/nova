import express from "express";
import {
  getAllProducts,
  getProductById,
  getFeaturedProducts,
  getBestSellers,
  getNewArrivals,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteProductImage,
  setPrimaryImage,
} from "../controller/productController.js";
import auth from "../middlewares/Auth.js";
import roleAuthorization from "../middlewares/roleAuthorization.js";
import { setUploadFolder, upload } from "../middlewares/upload.js";
import { USER_ROLES } from "../config/constants.js";

const router = express.Router();

// Public routes
router.get("/", getAllProducts);
router.get("/featured", getFeaturedProducts);
router.get("/best-sellers", getBestSellers);
router.get("/new-arrivals", getNewArrivals);
router.get("/:productId", getProductById); // productId can be ID or slug

// Admin only routes
router.use(auth, roleAuthorization([USER_ROLES.admin]));
router.post("/", setUploadFolder("products"), upload.array("images", 5), createProduct);
router.patch("/:productId", setUploadFolder("products"), upload.array("images", 5), updateProduct);
router.delete("/:productId", deleteProduct);
router.delete("/images/:imageId", deleteProductImage);
router.patch("/images/:imageId/primary", setPrimaryImage);

export default router;
