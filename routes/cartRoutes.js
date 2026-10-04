import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controller/cartController.js";
import auth from "../middlewares/Auth.js";

const router = express.Router();

// All cart routes require authentication
router.use(auth);

router.get("/", getCart);
router.post("/add", addToCart);
router.patch("/item/:cartItemId", updateCartItem);
router.delete("/item/:cartItemId", removeCartItem);
router.delete("/clear", clearCart);

export default router;
