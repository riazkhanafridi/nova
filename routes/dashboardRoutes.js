import express from "express";
import {
  getDashboardOverview,
  getSalesAnalytics,
  getRecentOrders,
  getTopProducts,
} from "../controller/dashboardController.js";
import auth from "../middlewares/Auth.js";
import roleAuthorization from "../middlewares/roleAuthorization.js";
import { USER_ROLES } from "../config/constants.js";

const router = express.Router();

// All dashboard routes are protected and admin-only
router.use(auth, roleAuthorization([USER_ROLES.admin]));

router.get("/overview", getDashboardOverview);
router.get("/analytics", getSalesAnalytics);
router.get("/recent-orders", getRecentOrders);
router.get("/top-products", getTopProducts);

export default router;
