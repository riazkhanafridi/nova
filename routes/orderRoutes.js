import express from "express";
import {
  placeOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
} from "../controller/orderController.js";
import auth from "../middlewares/Auth.js";
import roleAuthorization from "../middlewares/roleAuthorization.js";
import { USER_ROLES } from "../config/constants.js";

const router = express.Router();

// Protected routes (Customer & Admin)
router.use(auth);

router.post("/place", placeOrder);
router.get("/my-orders", getMyOrders);
router.get("/:orderId", getOrderById);
router.post("/:orderId/cancel", cancelOrder);

// Admin only routes
router.get("/", roleAuthorization([USER_ROLES.admin]), getAllOrders);
router.patch("/:orderId/status", roleAuthorization([USER_ROLES.admin]), updateOrderStatus);

export default router;
