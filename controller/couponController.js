import SuccessMessage from "../utils/SuccessMessage.js";
import ErrorHandler from "../utils/errorHandler.js";
import AsyncWrapper from "../utils/asyncWrapper.js";
import Coupon from "../models/Coupon.js";
import { COUPON_TYPE } from "../config/constants.js";
import { calculateDiscount, getPagination, getPaginationMeta } from "../utils/helpers.js";
import { Op } from "sequelize";

// ─── Validate Coupon (Customer) ──────────────────────────────────────────────────
export const validateCoupon = AsyncWrapper(async (req, res, next) => {
  const { code, orderAmount } = req.body;

  if (!code || !orderAmount) {
    return next(new ErrorHandler("Coupon code and order amount are required", 400));
  }

  const coupon = await Coupon.findOne({
    where: { code: code.toUpperCase(), isActive: true },
  });

  if (!coupon) {
    return next(new ErrorHandler("Invalid coupon code", 404));
  }

  if (coupon.expiresAt && new Date() > coupon.expiresAt) {
    return next(new ErrorHandler("Coupon has expired", 400));
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return next(new ErrorHandler("Coupon usage limit has been reached", 400));
  }

  if (parseFloat(orderAmount) < parseFloat(coupon.minOrderAmount)) {
    return next(
      new ErrorHandler(
        `Minimum order amount of ${coupon.minOrderAmount} required for this coupon`,
        400
      )
    );
  }

  const discountAmount = calculateDiscount(coupon, parseFloat(orderAmount));

  return SuccessMessage(res, "Coupon is valid", {
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    discountAmount,
    minOrderAmount: coupon.minOrderAmount,
    maxDiscountAmount: coupon.maxDiscountAmount,
    expiresAt: coupon.expiresAt,
  });
});

// ─── Admin: Get All Coupons ──────────────────────────────────────────────────────
export const getAllCoupons = AsyncWrapper(async (req, res, next) => {
  const { page = 1, limit = 20, search, isActive } = req.query;
  const { offset, page: p, limit: l } = getPagination(page, limit);

  const where = {};
  if (search) where.code = { [Op.like]: `%${search.toUpperCase()}%` };
  if (isActive !== undefined) where.isActive = isActive === "true";

  const { count, rows } = await Coupon.findAndCountAll({
    where,
    limit: l,
    offset,
    order: [["createdAt", "DESC"]],
  });

  return SuccessMessage(res, "Coupons fetched successfully", {
    coupons: rows,
    pagination: getPaginationMeta(count, p, l),
  });
});

// ─── Admin: Create Coupon ────────────────────────────────────────────────────────
export const createCoupon = AsyncWrapper(async (req, res, next) => {
  const {
    code, description, type, value,
    minOrderAmount, maxDiscountAmount, usageLimit,
    perUserLimit, isActive, expiresAt,
  } = req.body;

  if (!code || !type || value === undefined) {
    return next(new ErrorHandler("Code, type and value are required", 400));
  }

  if (!Object.values(COUPON_TYPE).includes(type)) {
    return next(new ErrorHandler("Invalid coupon type. Must be PERCENTAGE or FIXED", 400));
  }

  if (type === COUPON_TYPE.percentage && (value < 0 || value > 100)) {
    return next(new ErrorHandler("Percentage value must be between 0 and 100", 422));
  }

  const existing = await Coupon.findOne({ where: { code: code.toUpperCase() } });
  if (existing) {
    return next(new ErrorHandler("Coupon code already exists", 409));
  }

  const coupon = await Coupon.create({
    code: code.toUpperCase(),
    description,
    type,
    value: parseFloat(value),
    minOrderAmount: parseFloat(minOrderAmount) || 0,
    maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : null,
    usageLimit: usageLimit ? parseInt(usageLimit) : null,
    perUserLimit: parseInt(perUserLimit) || 1,
    isActive: isActive !== false,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
  });

  return SuccessMessage(res, "Coupon created successfully", coupon, 201);
});

// ─── Admin: Update Coupon ────────────────────────────────────────────────────────
export const updateCoupon = AsyncWrapper(async (req, res, next) => {
  const { couponId } = req.params;

  const coupon = await Coupon.findByPk(couponId);
  if (!coupon) {
    return next(new ErrorHandler("Coupon not found", 404));
  }

  const {
    description, type, value, minOrderAmount,
    maxDiscountAmount, usageLimit, perUserLimit, isActive, expiresAt,
  } = req.body;

  const fields = {
    description, type, value, minOrderAmount,
    maxDiscountAmount, usageLimit, perUserLimit, isActive, expiresAt,
  };

  Object.entries(fields).forEach(([key, val]) => {
    if (val !== undefined) coupon[key] = val;
  });

  await coupon.save();
  return SuccessMessage(res, "Coupon updated successfully", coupon);
});

// ─── Admin: Delete Coupon ────────────────────────────────────────────────────────
export const deleteCoupon = AsyncWrapper(async (req, res, next) => {
  const { couponId } = req.params;

  const coupon = await Coupon.findByPk(couponId);
  if (!coupon) {
    return next(new ErrorHandler("Coupon not found", 404));
  }

  await coupon.destroy();
  return SuccessMessage(res, "Coupon deleted successfully");
});
