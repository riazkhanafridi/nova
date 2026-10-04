import express from "express";
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  getAllReviews,
  updateReviewStatus,
} from "../controller/reviewController.js";
import auth from "../middlewares/Auth.js";
import roleAuthorization from "../middlewares/roleAuthorization.js";
import { setUploadFolder, upload } from "../middlewares/upload.js";
import { USER_ROLES } from "../config/constants.js";

const router = express.Router();

// Public routes
router.get("/product/:productId", getProductReviews);

// Protected routes (Customer & Admin)
router.post(
  "/product/:productId",
  auth,
  setUploadFolder("reviews"),
  upload.array("images", 3),
  createReview
);
router.patch("/:reviewId", auth, updateReview);
router.delete("/:reviewId", auth, deleteReview);

// Admin only routes
router.get("/", auth, roleAuthorization([USER_ROLES.admin]), getAllReviews);
router.patch("/:reviewId/status", auth, roleAuthorization([USER_ROLES.admin]), updateReviewStatus);

export default router;
