import express from "express";
import {
  validateCoupon,
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "../controller/couponController.js";
import auth from "../middlewares/Auth.js";
import roleAuthorization from "../middlewares/roleAuthorization.js";
import { USER_ROLES } from "../config/constants.js";

const router = express.Router();

// Protected routes (Customer & Admin)
router.post("/validate", auth, validateCoupon);

// Admin only routes
router.use(auth, roleAuthorization([USER_ROLES.admin]));
router.get("/", getAllCoupons);
router.post("/", createCoupon);
router.patch("/:couponId", updateCoupon);
router.delete("/:couponId", deleteCoupon);

export default router;
