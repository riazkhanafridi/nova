import SuccessMessage from "../utils/SuccessMessage.js";
import ErrorHandler from "../utils/errorHandler.js";
import AsyncWrapper from "../utils/asyncWrapper.js";
import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";
import ProductImage from "../models/ProductImage.js";
import Brand from "../models/Brand.js";

// ─── Get My Wishlist ─────────────────────────────────────────────────────────────
export const getWishlist = AsyncWrapper(async (req, res, next) => {
  const items = await Wishlist.findAll({
    where: { userId: req.user.userId },
    include: [
      {
        model: Product,
        as: "product",
        attributes: ["productId", "name", "slug", "price", "comparePrice", "averageRating", "reviewCount", "status"],
        include: [
          {
            model: ProductImage,
            as: "images",
            where: { isPrimary: true },
            required: false,
            limit: 1,
          },
          {
            model: Brand,
            as: "brand",
            attributes: ["brandId", "name"],
          },
        ],
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  return SuccessMessage(res, "Wishlist fetched successfully", {
    items,
    count: items.length,
  });
});

// ─── Toggle Wishlist (Add / Remove) ─────────────────────────────────────────────
export const toggleWishlist = AsyncWrapper(async (req, res, next) => {
  const { productId } = req.body;
  const userId = req.user.userId;

  if (!productId) {
    return next(new ErrorHandler("Product ID is required", 400));
  }

  const product = await Product.findByPk(productId);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  const existing = await Wishlist.findOne({ where: { userId, productId } });

  if (existing) {
    await existing.destroy();
    return SuccessMessage(res, "Product removed from wishlist", { wishlisted: false });
  } else {
    await Wishlist.create({ userId, productId });
    return SuccessMessage(res, "Product added to wishlist", { wishlisted: true });
  }
});

// ─── Check if Product is in Wishlist ────────────────────────────────────────────
export const checkWishlist = AsyncWrapper(async (req, res, next) => {
  const { productId } = req.params;
  const userId = req.user.userId;

  const item = await Wishlist.findOne({ where: { userId, productId } });
  return SuccessMessage(res, "Wishlist status", { wishlisted: !!item });
});

// ─── Clear Wishlist ──────────────────────────────────────────────────────────────
export const clearWishlist = AsyncWrapper(async (req, res, next) => {
  await Wishlist.destroy({ where: { userId: req.user.userId } });
  return SuccessMessage(res, "Wishlist cleared successfully");
});
