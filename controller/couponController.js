import SuccessMessage from "../utils/SuccessMessage.js";
import ErrorHandler from "../utils/errorHandler.js";
import AsyncWrapper from "../utils/asyncWrapper.js";
import Coupon from "../models/Coupon.js";
import { COUPON_TYPE } from "../config/constants.js";
import { calculateDiscount, getPagination, getPaginationMeta } from "../utils/helpers.js";
import { col, Op } from "sequelize";

const parseExpirationDate = (value) => {
  if (!value) return null;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T23:59:59.999Z`)
    : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

// ─── Validate Coupon (Customer) ──────────────────────────────────────────────────
export const validateCoupon = AsyncWrapper(async (req, res, next) => {
  const { code, orderAmount } = req.body;

  const amount = Number(orderAmount);
  if (typeof code !== "string" || !code.trim() || !Number.isFinite(amount) || amount < 0) {
    return next(new ErrorHandler("Coupon code and order amount are required", 400));
  }

  const coupon = await Coupon.findOne({
    where: { code: code.trim().toUpperCase(), isActive: true },
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

  if (amount < parseFloat(coupon.minOrderAmount)) {
    return next(
      new ErrorHandler(
        `Minimum order amount of ${coupon.minOrderAmount} required for this coupon`,
        400
      )
    );
  }

  const discountAmount = calculateDiscount(coupon, amount);

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

// ─── Customer: List currently available coupons ─────────────────────────────────
export const getAvailableCoupons = AsyncWrapper(async (req, res) => {
  const now = new Date();
  const coupons = await Coupon.findAll({
    where: {
      isActive: true,
      [Op.and]: [
        {
          [Op.or]: [
            { expiresAt: null },
            { expiresAt: { [Op.gte]: now } },
          ],
        },
        {
          [Op.or]: [
            { usageLimit: null },
            { usageLimit: { [Op.gt]: col("usedCount") } },
          ],
        },
      ],
    },
    attributes: ["couponId", "code", "description", "type", "value", "minOrderAmount", "maxDiscountAmount", "expiresAt"],
    order: [["createdAt", "DESC"]],
  });

  return SuccessMessage(res, "Available coupons fetched successfully", coupons);
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

  if (typeof code !== "string" || !code.trim() || !type || value === undefined) {
    return next(new ErrorHandler("Code, type and value are required", 400));
  }

  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return next(new ErrorHandler("Coupon value must be a positive number", 400));
  }

  if (!Object.values(COUPON_TYPE).includes(type)) {
    return next(new ErrorHandler("Invalid coupon type. Must be PERCENTAGE or FIXED", 400));
  }

  if (type === COUPON_TYPE.percentage && numericValue > 100) {
    return next(new ErrorHandler("Percentage value must be between 0 and 100", 422));
  }

  const normalizedCode = code.trim().toUpperCase();
  const existing = await Coupon.findOne({ where: { code: normalizedCode } });
  if (existing) {
    return next(new ErrorHandler("Coupon code already exists", 409));
  }

  const coupon = await Coupon.create({
    code: normalizedCode,
    description,
    type,
    value: numericValue,
    minOrderAmount: parseFloat(minOrderAmount) || 0,
    maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : null,
    usageLimit: usageLimit ? parseInt(usageLimit) : null,
    perUserLimit: parseInt(perUserLimit) || 1,
    isActive: isActive !== false,
    expiresAt: parseExpirationDate(expiresAt),
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
    code, description, type, value, minOrderAmount,
    maxDiscountAmount, usageLimit, perUserLimit, isActive, expiresAt,
  } = req.body;

  if (code !== undefined) {
    if (typeof code !== "string" || !code.trim()) {
      return next(new ErrorHandler("Coupon code cannot be empty", 400));
    }
    const normalizedCode = code.trim().toUpperCase();
    const existing = await Coupon.findOne({
      where: { code: normalizedCode, couponId: { [Op.ne]: couponId } },
    });
    if (existing) {
      return next(new ErrorHandler("Coupon code already exists", 409));
    }
    coupon.code = normalizedCode;
  }
  if (type !== undefined && !Object.values(COUPON_TYPE).includes(type)) {
    return next(new ErrorHandler("Invalid coupon type. Must be PERCENTAGE or FIXED", 400));
  }
  const numericValue = value === undefined ? Number(coupon.value) : Number(value);
  if (value !== undefined) {
    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      return next(new ErrorHandler("Coupon value must be a positive number", 400));
    }
  }
  if ((type ?? coupon.type) === COUPON_TYPE.percentage && numericValue > 100) {
    return next(new ErrorHandler("Percentage value must be between 0 and 100", 422));
  }

  const fields = {
    description, type, minOrderAmount,
    maxDiscountAmount, usageLimit, perUserLimit, isActive,
  };

  Object.entries(fields).forEach(([key, val]) => {
    if (val !== undefined) coupon[key] = val;
  });
  if (value !== undefined) coupon.value = numericValue;
  if (expiresAt !== undefined) coupon.expiresAt = parseExpirationDate(expiresAt);

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
