/**
 * Generate a unique order number: NOVA-YYYYMMDD-XXXXX
 */
export const generateOrderNumber = () => {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(10000 + Math.random() * 90000);
  return `NOVA-${date}-${random}`;
};

/**
 * Generate a URL-friendly slug from a string
 */
export const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

/**
 * Calculate pagination metadata
 */
export const getPagination = (page = 1, limit = 10) => {
  const parsedPage = Math.max(1, parseInt(page));
  const parsedLimit = Math.min(100, Math.max(1, parseInt(limit)));
  const offset = (parsedPage - 1) * parsedLimit;
  return { page: parsedPage, limit: parsedLimit, offset };
};

/**
 * Build pagination response meta
 */
export const getPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};

/**
 * Calculate discount amount from coupon
 */
export const calculateDiscount = (coupon, subTotal) => {
  if (!coupon || !coupon.isActive) return 0;
  if (subTotal < coupon.minOrderAmount) return 0;

  let discount = 0;
  if (coupon.type === "PERCENTAGE") {
    discount = (subTotal * coupon.value) / 100;
    if (coupon.maxDiscountAmount) {
      discount = Math.min(discount, coupon.maxDiscountAmount);
    }
  } else {
    discount = Math.min(coupon.value, subTotal);
  }
  return parseFloat(discount.toFixed(2));
};

/**
 * Generate a 6-digit OTP code
 */
export const generateOTP = () => {
  return String(Math.floor(100000 + Math.random() * 900000));
};
