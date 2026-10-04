import SuccessMessage from "../utils/SuccessMessage.js";
import ErrorHandler from "../utils/errorHandler.js";
import AsyncWrapper from "../utils/asyncWrapper.js";
import Review from "../models/Review.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import { getPagination, getPaginationMeta } from "../utils/helpers.js";
import { REVIEW_STATUS } from "../config/constants.js";
import { fn, col, literal } from "sequelize";

// ─── Get Product Reviews (Public) ───────────────────────────────────────────────
export const getProductReviews = AsyncWrapper(async (req, res, next) => {
  const { productId } = req.params;
  const { page = 1, limit = 10, sortBy = "createdAt" } = req.query;
  const { offset, page: p, limit: l } = getPagination(page, limit);

  const product = await Product.findByPk(productId);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  const { count, rows } = await Review.findAndCountAll({
    where: { productId, status: REVIEW_STATUS.approved },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["userId", "fullName", "avatar"],
      },
    ],
    limit: l,
    offset,
    order: [[sortBy === "rating" ? "rating" : "createdAt", "DESC"]],
    distinct: true,
  });

  // Rating distribution
  const ratingStats = await Review.findAll({
    where: { productId, status: REVIEW_STATUS.approved },
    attributes: [
      "rating",
      [fn("COUNT", col("rating")), "count"],
    ],
    group: ["rating"],
    raw: true,
  });

  return SuccessMessage(res, "Reviews fetched successfully", {
    reviews: rows,
    pagination: getPaginationMeta(count, p, l),
    ratingStats,
  });
});

// ─── Create Review ───────────────────────────────────────────────────────────────
export const createReview = AsyncWrapper(async (req, res, next) => {
  const { productId } = req.params;
  const { rating, title, comment, orderId } = req.body;
  const userId = req.user.userId;

  if (!rating) {
    return next(new ErrorHandler("Rating is required", 400));
  }

  if (rating < 1 || rating > 5) {
    return next(new ErrorHandler("Rating must be between 1 and 5", 422));
  }

  const product = await Product.findByPk(productId);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  // Check if user already reviewed this product
  const existingReview = await Review.findOne({ where: { productId, userId } });
  if (existingReview) {
    return next(new ErrorHandler("You have already reviewed this product", 409));
  }

  // Check verified purchase
  let isVerifiedPurchase = false;
  if (orderId) {
    const orderItem = await OrderItem.findOne({
      where: { productId, orderId },
      include: [{ model: Order, as: "order", where: { userId } }],
    });
    isVerifiedPurchase = !!orderItem;
  }

  const images = req.files?.length
    ? req.files.map((f) => `/uploads/reviews/${f.filename}`)
    : null;

  const review = await Review.create({
    productId,
    userId,
    orderId: orderId || null,
    rating: parseInt(rating),
    title,
    comment,
    images,
    isVerifiedPurchase,
    status: REVIEW_STATUS.approved, // Auto-approve (change to pending for moderation)
  });

  // Recalculate product average rating
  const stats = await Review.findAll({
    where: { productId, status: REVIEW_STATUS.approved },
    attributes: [
      [fn("AVG", col("rating")), "avgRating"],
      [fn("COUNT", col("reviewId")), "totalReviews"],
    ],
    raw: true,
  });

  if (stats[0]) {
    await Product.update(
      {
        averageRating: parseFloat(stats[0].avgRating || 0).toFixed(2),
        reviewCount: parseInt(stats[0].totalReviews || 0),
      },
      { where: { productId } }
    );
  }

  return SuccessMessage(res, "Review submitted successfully", review, 201);
});

// ─── Update Review ───────────────────────────────────────────────────────────────
export const updateReview = AsyncWrapper(async (req, res, next) => {
  const { reviewId } = req.params;
  const { rating, title, comment } = req.body;

  const review = await Review.findOne({
    where: { reviewId, userId: req.user.userId },
  });

  if (!review) {
    return next(new ErrorHandler("Review not found", 404));
  }

  if (rating) {
    if (rating < 1 || rating > 5) {
      return next(new ErrorHandler("Rating must be between 1 and 5", 422));
    }
    review.rating = parseInt(rating);
  }
  if (title !== undefined) review.title = title;
  if (comment !== undefined) review.comment = comment;

  await review.save();

  // Recalculate average rating
  const stats = await Review.findAll({
    where: { productId: review.productId, status: REVIEW_STATUS.approved },
    attributes: [
      [fn("AVG", col("rating")), "avgRating"],
      [fn("COUNT", col("reviewId")), "totalReviews"],
    ],
    raw: true,
  });

  if (stats[0]) {
    await Product.update(
      {
        averageRating: parseFloat(stats[0].avgRating || 0).toFixed(2),
        reviewCount: parseInt(stats[0].totalReviews || 0),
      },
      { where: { productId: review.productId } }
    );
  }

  return SuccessMessage(res, "Review updated successfully", review);
});

// ─── Delete Review ───────────────────────────────────────────────────────────────
export const deleteReview = AsyncWrapper(async (req, res, next) => {
  const { reviewId } = req.params;

  const where = { reviewId };
  if (req.user.role !== "admin") {
    where.userId = req.user.userId;
  }

  const review = await Review.findOne({ where });
  if (!review) {
    return next(new ErrorHandler("Review not found", 404));
  }

  const { productId } = review;
  await review.destroy();

  // Recalculate average rating
  const stats = await Review.findAll({
    where: { productId, status: REVIEW_STATUS.approved },
    attributes: [
      [fn("AVG", col("rating")), "avgRating"],
      [fn("COUNT", col("reviewId")), "totalReviews"],
    ],
    raw: true,
  });

  await Product.update(
    {
      averageRating: parseFloat(stats[0]?.avgRating || 0).toFixed(2),
      reviewCount: parseInt(stats[0]?.totalReviews || 0),
    },
    { where: { productId } }
  );

  return SuccessMessage(res, "Review deleted successfully");
});

// ─── Admin: Get All Reviews ──────────────────────────────────────────────────────
export const getAllReviews = AsyncWrapper(async (req, res, next) => {
  const { page = 1, limit = 20, status } = req.query;
  const { offset, page: p, limit: l } = getPagination(page, limit);

  const where = {};
  if (status) where.status = status;

  const { count, rows } = await Review.findAndCountAll({
    where,
    include: [
      { model: User, as: "user", attributes: ["userId", "fullName", "email"] },
      { model: Product, as: "product", attributes: ["productId", "name"] },
    ],
    limit: l,
    offset,
    order: [["createdAt", "DESC"]],
    distinct: true,
  });

  return SuccessMessage(res, "Reviews fetched successfully", {
    reviews: rows,
    pagination: getPaginationMeta(count, p, l),
  });
});

// ─── Admin: Update Review Status ─────────────────────────────────────────────────
export const updateReviewStatus = AsyncWrapper(async (req, res, next) => {
  const { reviewId } = req.params;
  const { status } = req.body;

  if (!Object.values(REVIEW_STATUS).includes(status)) {
    return next(new ErrorHandler("Invalid status value", 400));
  }

  const review = await Review.findByPk(reviewId);
  if (!review) {
    return next(new ErrorHandler("Review not found", 404));
  }

  review.status = status;
  await review.save();

  return SuccessMessage(res, "Review status updated", review);
});
