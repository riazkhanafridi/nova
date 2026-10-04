import express from "express";
import {
  getWishlist,
  toggleWishlist,
  checkWishlist,
  clearWishlist,
} from "../controller/wishlistController.js";
import auth from "../middlewares/Auth.js";

const router = express.Router();

// All wishlist routes require authentication
router.use(auth);

router.get("/", getWishlist);
router.post("/toggle", toggleWishlist);
router.get("/check/:productId", checkWishlist);
router.delete("/clear", clearWishlist);

export default router;
