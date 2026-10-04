import express from "express";
import authRoutes from "./authRoutes.js";
import categoryRoutes from "./categoryRoutes.js";
import brandRoutes from "./brandRoutes.js";
import productRoutes from "./productRoutes.js";
import cartRoutes from "./cartRoutes.js";
import orderRoutes from "./orderRoutes.js";
import reviewRoutes from "./reviewRoutes.js";
import wishlistRoutes from "./wishlistRoutes.js";
import addressRoutes from "./addressRoutes.js";
import couponRoutes from "./couponRoutes.js";
import notificationRoutes from "./notificationRoutes.js";
import bannerRoutes from "./bannerRoutes.js";
import dashboardRoutes from "./dashboardRoutes.js";
import serviceRoutes from "./serviceRoutes.js";
import paymentRoutes from "./paymentRoutes.js";

const router = express.Router();

// Health check endpoint
router.get("/health", (req, res) => {
  return res.status(200).json({ success: true, message: "NOVA API is running properly" });
});

// Route mounting
router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/brands", brandRoutes);
router.use("/products", productRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);
router.use("/reviews", reviewRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/addresses", addressRoutes);
router.use("/coupons", couponRoutes);
router.use("/notifications", notificationRoutes);
router.use("/banners", bannerRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/services", serviceRoutes);
router.use("/payment", paymentRoutes);

export default router;
