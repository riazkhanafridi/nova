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

const setupAssociations = () => {
  // ── Category (self-referential for sub-categories) ──────────────
  Category.hasMany(Category, { foreignKey: "parentId", as: "subCategories" });
  Category.belongsTo(Category, { foreignKey: "parentId", as: "parent" });

  // ── Product ─────────────────────────────────────────────────────
  Category.hasMany(Product, { foreignKey: "categoryId", as: "products" });
  Product.belongsTo(Category, { foreignKey: "categoryId", as: "category" });

  Brand.hasMany(Product, { foreignKey: "brandId", as: "products" });
  Product.belongsTo(Brand, { foreignKey: "brandId", as: "brand" });

  // ── Product Images ───────────────────────────────────────────────
  Product.hasMany(ProductImage, { foreignKey: "productId", as: "images" });
  ProductImage.belongsTo(Product, { foreignKey: "productId", as: "product" });

  // ── Address ─────────────────────────────────────────────────────
  User.hasMany(Address, { foreignKey: "userId", as: "addresses" });
  Address.belongsTo(User, { foreignKey: "userId", as: "user" });

  // ── Cart ─────────────────────────────────────────────────────────
  User.hasOne(Cart, { foreignKey: "userId", as: "cart" });
  Cart.belongsTo(User, { foreignKey: "userId", as: "user" });

  Cart.hasMany(CartItem, { foreignKey: "cartId", as: "items" });
  CartItem.belongsTo(Cart, { foreignKey: "cartId", as: "cart" });

  Product.hasMany(CartItem, { foreignKey: "productId" });
  CartItem.belongsTo(Product, { foreignKey: "productId", as: "product" });

  // ── Order ────────────────────────────────────────────────────────
  User.hasMany(Order, { foreignKey: "userId", as: "orders" });
  Order.belongsTo(User, { foreignKey: "userId", as: "user" });

  Address.hasMany(Order, { foreignKey: "addressId" });
  Order.belongsTo(Address, { foreignKey: "addressId", as: "address" });

  Coupon.hasMany(Order, { foreignKey: "couponId" });
  Order.belongsTo(Coupon, { foreignKey: "couponId", as: "coupon" });

  Order.hasMany(OrderItem, { foreignKey: "orderId", as: "items" });
  OrderItem.belongsTo(Order, { foreignKey: "orderId", as: "order" });

  Product.hasMany(OrderItem, { foreignKey: "productId" });
  OrderItem.belongsTo(Product, { foreignKey: "productId", as: "product" });

  // ── Review ───────────────────────────────────────────────────────
  User.hasMany(Review, { foreignKey: "userId", as: "reviews" });
  Review.belongsTo(User, { foreignKey: "userId", as: "user" });

  Product.hasMany(Review, { foreignKey: "productId", as: "reviews" });
  Review.belongsTo(Product, { foreignKey: "productId", as: "product" });

  Order.hasMany(Review, { foreignKey: "orderId" });
  Review.belongsTo(Order, { foreignKey: "orderId", as: "order" });

  // ── Wishlist ─────────────────────────────────────────────────────
  User.hasMany(Wishlist, { foreignKey: "userId", as: "wishlists" });
  Wishlist.belongsTo(User, { foreignKey: "userId", as: "user" });

  Product.hasMany(Wishlist, { foreignKey: "productId" });
  Wishlist.belongsTo(Product, { foreignKey: "productId", as: "product" });

  // ── Notification ─────────────────────────────────────────────────
  User.hasMany(Notification, { foreignKey: "userId", as: "notifications" });
  Notification.belongsTo(User, { foreignKey: "userId", as: "user" });
};

export default setupAssociations;
