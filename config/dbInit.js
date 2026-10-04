import { sequelize } from "./dbConnect.js";
import User from "../models/User.js";
import Category from "../models/Category.js";
import Brand from "../models/Brand.js";
import Product from "../models/Product.js";
import ProductImage from "../models/ProductImage.js";
import Address from "../models/Address.js";
import Cart from "../models/Cart.js";
import CartItem from "../models/CartItem.js";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import Review from "../models/Review.js";
import Wishlist from "../models/Wishlist.js";
import Coupon from "../models/Coupon.js";
import Notification from "../models/Notification.js";
import Banner from "../models/Banner.js";
import Service from "../models/Service.js";

const dbInit = async () => {
  try {
    // Use a single safe sync call. Avoid alter: true because it issues ALTER TABLE
    // statements on every startup and can hit MySQL's 64-key table limit.
    await sequelize.sync();

    console.log("✅ All NOVA models synced successfully!");
  } catch (err) {
    console.error("❌ Database sync failed:", err);
  }
};

export default dbInit;
