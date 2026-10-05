import express from "express";
import {
  validateCoupon,
  getAvailableCoupons,
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "../controller/couponController.js";
import auth from "../middlewares/Auth.js";
import roleAuthorization from "../middlewares/roleAuthorization.js";
import { USER_ROLES } from "../config/constants.js";

const router = express.Router();

// Coupon validity is public so guest customers can validate codes in their cart.
router.post("/validate", validateCoupon);
router.get("/available", getAvailableCoupons);

// Admin only routes
router.use(auth, roleAuthorization([USER_ROLES.admin]));
router.get("/", getAllCoupons);
router.post("/", createCoupon);
router.patch("/:couponId", updateCoupon);
router.delete("/:couponId", deleteCoupon);

export default router;
