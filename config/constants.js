import dotenv from "dotenv";
dotenv.config();

const envVariables = {
  appPort: process.env.PORT || 8000,
  dbUserName: process.env.DB_USERNAME,
  dbPassword: process.env.DB_PASSWORD,
  dbHostName: process.env.DB_HOSTNAME,
  dbName: process.env.DB_NAME,
  dbPort: process.env.DB_PORT,
  frontendUrl: process.env.FRONTEND_URL,
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
  maxPasswordAttempts: process.env.MAX_PASSWORD_ATTEMPTS || 5,
  nodeEnv: process.env.NODE_ENV || "development",
};

// ─── User ──────────────────────────────────────────────────────────
export const USER_STATUS = {
  active: "ACTIVE",
  blocked: "BLOCKED",
};

export const USER_ROLES = {
  admin: "admin",
  customer: "customer",
};

// ─── Product ───────────────────────────────────────────────────────
export const PRODUCT_STATUS = {
  active: "ACTIVE",
  inactive: "INACTIVE",
  draft: "DRAFT",
};

export const PRODUCT_CONDITION = {
  new: "NEW",
  refurbished: "REFURBISHED",
  used: "USED",
};

// ─── Order ─────────────────────────────────────────────────────────
export const ORDER_STATUS = {
  pending: "PENDING",
  confirmed: "CONFIRMED",
  processing: "PROCESSING",
  shipped: "SHIPPED",
  delivered: "DELIVERED",
  cancelled: "CANCELLED",
  refunded: "REFUNDED",
};

export const PAYMENT_STATUS = {
  pending: "PENDING",
  paid: "PAID",
  failed: "FAILED",
  refunded: "REFUNDED",
};

export const PAYMENT_METHOD = {
  cash: "CASH",
  card: "CARD",
  online: "ONLINE",
  wallet: "WALLET",
};

// ─── Review ────────────────────────────────────────────────────────
export const REVIEW_STATUS = {
  pending: "PENDING",
  approved: "APPROVED",
  rejected: "REJECTED",
};

// ─── Coupon ────────────────────────────────────────────────────────
export const COUPON_TYPE = {
  percentage: "PERCENTAGE",
  fixed: "FIXED",
};

// ─── Address ───────────────────────────────────────────────────────
export const ADDRESS_TYPE = {
  home: "HOME",
  office: "OFFICE",
  other: "OTHER",
};

// ─── Notification ──────────────────────────────────────────────────
export const NOTIFICATION_TYPE = {
  order: "ORDER",
  promo: "PROMO",
  system: "SYSTEM",
};

export default envVariables;
