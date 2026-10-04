import SuccessMessage from "../utils/SuccessMessage.js";
import ErrorHandler from "../utils/errorHandler.js";
import AsyncWrapper from "../utils/asyncWrapper.js";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import Cart from "../models/Cart.js";
import CartItem from "../models/CartItem.js";
import Product from "../models/Product.js";
import ProductImage from "../models/ProductImage.js";
import Address from "../models/Address.js";
import Coupon from "../models/Coupon.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import {
  generateOrderNumber,
  calculateDiscount,
  getPagination,
  getPaginationMeta,
} from "../utils/helpers.js";
import { ORDER_STATUS, PAYMENT_STATUS, NOTIFICATION_TYPE } from "../config/constants.js";
import { Op } from "sequelize";

const SHIPPING_FEE = 150; // Fixed shipping fee in PKR

const serializeOrderItem = (item) => {
  if (!item) return item;
  const row = item.toJSON ? item.toJSON() : item;
  const product = row.product ?? row.Product ?? null;
  return {
    ...row,
    Product: product ? {
      ...(product.toJSON ? product.toJSON() : product),
      ProductImages: product.images ?? product.ProductImages ?? [],
    } : null,
  };
};

const serializeOrder = (order) => {
  if (!order) return order;
  const row = order.toJSON ? order.toJSON() : order;
  const normalizedShipping = row.shippingAddress ? { ...row.shippingAddress } : null;
  if (normalizedShipping && !normalizedShipping.street && row.shippingAddress.addressLine1) {
    normalizedShipping.street = row.shippingAddress.addressLine1;
  }

  return {
    ...row,
    shippingAddress: normalizedShipping,
    User: row.user ?? row.User ?? null,
    OrderItems: (row.items ?? row.OrderItems ?? []).map(serializeOrderItem),
    Coupon: row.coupon ?? row.Coupon ?? null,
  };
};

// ─── Place Order ────────────────────────────────────────────────────────────────
export const placeOrder = AsyncWrapper(async (req, res, next) => {
  const { addressId, paymentMethod, couponCode, notes, paymentIntentId, paymentStatus, items: fallbackItems } = req.body;
  const userId = req.user.userId;

  if (!addressId || !paymentMethod) {
    return next(new ErrorHandler("Address and payment method are required", 400));
  }

  // Validate address belongs to user
  const address = await Address.findOne({ where: { addressId, userId } });
  if (!address) {
    return next(new ErrorHandler("Address not found", 404));
  }

  // Get cart with items
  const cart = await Cart.findOne({
    where: { userId },
    include: [
      {
        model: CartItem,
        as: "items",
        include: [{ model: Product, as: "product" }],
      },
    ],
  });

  let itemsToProcess = [];
  if (cart && cart.items && cart.items.length > 0) {
    itemsToProcess = cart.items.map(item => ({
      product: item.product,
      quantity: item.quantity,
    }));
  } else if (Array.isArray(fallbackItems) && fallbackItems.length > 0) {
    for (const item of fallbackItems) {
      const pId = item.productId || item.Product?.productId;
      if (pId) {
        const product = await Product.findByPk(pId);
        if (product) {
          itemsToProcess.push({ product, quantity: item.quantity || 1 });
        }
      }
    }
  }

  if (itemsToProcess.length === 0) {
    return next(new ErrorHandler("Your cart is empty", 400));
  }

  // Validate stock & calculate subtotal
  let subTotal = 0;
  const orderItemsData = [];

  for (const item of itemsToProcess) {
    const product = item.product;
    if (!product || product.status !== "ACTIVE") {
      return next(new ErrorHandler(`Product "${product?.name}" is no longer available`, 400));
    }
    if (product.quantity < item.quantity) {
      return next(new ErrorHandler(`Insufficient stock for "${product.name}"`, 400));
    }

    const primaryImage = await ProductImage.findOne({
      where: { productId: product.productId, isPrimary: true },
    });

    const itemTotal = parseFloat(product.price) * item.quantity;
    subTotal += itemTotal;

    orderItemsData.push({
      productId: product.productId,
      productName: product.name,
      productImage: primaryImage?.imageUrl || null,
      quantity: item.quantity,
      unitPrice: parseFloat(product.price),
      totalPrice: itemTotal,
    });
  }

  // Apply coupon
  let coupon = null;
  let discountAmount = 0;
  if (couponCode) {
    coupon = await Coupon.findOne({
      where: { code: couponCode.toUpperCase(), isActive: true },
    });
    if (!coupon) {
      return next(new ErrorHandler("Invalid or expired coupon code", 400));
    }
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return next(new ErrorHandler("Coupon has expired", 400));
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return next(new ErrorHandler("Coupon usage limit reached", 400));
    }
    discountAmount = calculateDiscount(coupon, subTotal);
  }

  const shippingFee = subTotal >= 5000 ? 0 : SHIPPING_FEE; // Free shipping over 5000
  const totalAmount = subTotal - discountAmount + shippingFee;

  // Determine initial payment status
  const finalPaymentStatus = (paymentMethod === "card" || paymentIntentId || paymentStatus === "PAID")
    ? PAYMENT_STATUS.paid
    : PAYMENT_STATUS.pending;

  // Create order
  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    userId,
    addressId,
    couponId: coupon?.couponId || null,
    subTotal,
    discountAmount,
    shippingFee,
    taxAmount: 0,
    totalAmount,
    orderStatus: ORDER_STATUS.pending,
    paymentStatus: finalPaymentStatus,
    paymentMethod: paymentMethod === "card" ? "card" : "cash_on_delivery",
    notes: notes || (paymentIntentId ? `Stripe PaymentIntent: ${paymentIntentId}` : null),
    shippingAddress: {
      recipientName: address.recipientName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      city: address.city,
      state: address.state,
      country: address.country,
      postalCode: address.postalCode,
    },
  });

  // Create order items & reduce stock
  for (const itemData of orderItemsData) {
    await OrderItem.create({ orderId: order.orderId, ...itemData });
    await Product.decrement("quantity", {
      by: itemData.quantity,
      where: { productId: itemData.productId },
    });
    await Product.increment("totalSold", {
      by: itemData.quantity,
      where: { productId: itemData.productId },
    });
  }

  // Update coupon usage
  if (coupon) {
    coupon.usedCount += 1;
    await coupon.save();
  }

  // Clear backend cart items directly
  if (cart) {
    await CartItem.destroy({ where: { cartId: cart.cartId } });
  }

  // Send notification
  await Notification.create({
    userId,
    type: NOTIFICATION_TYPE.order,
    title: "Order Placed Successfully! 🎉",
    message: `Your order #${order.orderNumber} has been placed. We'll notify you when it ships.`,
    referenceId: order.orderId,
    referenceType: "order",
  });

  const fullOrder = await Order.findByPk(order.orderId, {
    include: [{ model: OrderItem, as: "items" }],
  });

  return SuccessMessage(res, "Order placed successfully", fullOrder, 201);
});

// ─── Get My Orders ───────────────────────────────────────────────────────────────
export const getMyOrders = AsyncWrapper(async (req, res, next) => {
  const { page = 1, limit = 10, status } = req.query;
  const { offset, page: p, limit: l } = getPagination(page, limit);

  const where = { userId: req.user.userId };
  if (status) where.orderStatus = status;

  const { count, rows } = await Order.findAndCountAll({
    where,
    include: [
      {
        model: OrderItem,
        as: "items",
        include: [{ model: Product, as: "product", attributes: ["productId", "name", "slug", "price"], include: [{ model: ProductImage, as: "images", required: false }] }],
      },
    ],
    limit: l,
    offset,
    order: [["createdAt", "DESC"]],
    distinct: true,
  });

  const orders = rows.map(serializeOrder);

  return SuccessMessage(res, "Orders fetched successfully", {
    orders,
    pagination: getPaginationMeta(count, p, l),
  });
});

// ─── Get Single Order ────────────────────────────────────────────────────────────
export const getOrderById = AsyncWrapper(async (req, res, next) => {
  const { orderId } = req.params;

  const where = { orderId };
  if (req.user.role !== "admin") {
    where.userId = req.user.userId;
  }

  const order = await Order.findOne({
    where,
    include: [
      { model: OrderItem, as: "items", include: [{ model: Product, as: "product", include: [{ model: ProductImage, as: "images", required: false }] }] },
      { model: Coupon, as: "coupon", attributes: ["code", "type", "value"] },
    ],
  });

  if (!order) {
    return next(new ErrorHandler("Order not found", 404));
  }

  return SuccessMessage(res, "Order fetched successfully", serializeOrder(order));
});

// ─── Cancel Order ────────────────────────────────────────────────────────────────
export const cancelOrder = AsyncWrapper(async (req, res, next) => {
  const { orderId } = req.params;
  const { reason } = req.body;

  const order = await Order.findOne({
    where: { orderId, userId: req.user.userId },
    include: [{ model: OrderItem, as: "items" }],
  });

  if (!order) {
    return next(new ErrorHandler("Order not found", 404));
  }

  const cancellableStatuses = [ORDER_STATUS.pending, ORDER_STATUS.confirmed];
  if (!cancellableStatuses.includes(order.orderStatus)) {
    return next(new ErrorHandler(`Order cannot be cancelled. Current status: ${order.orderStatus}`, 400));
  }

  // Restore stock
  for (const item of order.items) {
    await Product.increment("quantity", {
      by: item.quantity,
      where: { productId: item.productId },
    });
    await Product.decrement("totalSold", {
      by: item.quantity,
      where: { productId: item.productId },
    });
  }

  order.orderStatus = ORDER_STATUS.cancelled;
  order.cancelledAt = new Date();
  order.cancelReason = reason || "Cancelled by customer";
  await order.save();

  await Notification.create({
    userId: req.user.userId,
    type: NOTIFICATION_TYPE.order,
    title: "Order Cancelled",
    message: `Your order #${order.orderNumber} has been cancelled.`,
    referenceId: order.orderId,
    referenceType: "order",
  });

  return SuccessMessage(res, "Order cancelled successfully", order);
});

// ─── Admin: Get All Orders ───────────────────────────────────────────────────────
export const getAllOrders = AsyncWrapper(async (req, res, next) => {
  const { page = 1, limit = 20, status, userId, search } = req.query;
  const { offset, page: p, limit: l } = getPagination(page, limit);

  const where = {};
  if (status) where.orderStatus = status;
  if (userId) where.userId = userId;
  if (search) where.orderNumber = { [Op.like]: `%${search}%` };

  const { count, rows } = await Order.findAndCountAll({
    where,
    include: [
      {
        model: User,
        as: "user",
        attributes: ["userId", "fullName", "email", "phone"],
      },
      { model: OrderItem, as: "items" },
    ],
    limit: l,
    offset,
    order: [["createdAt", "DESC"]],
    distinct: true,
  });

  return SuccessMessage(res, "Orders fetched successfully", {
    orders: rows,
    pagination: getPaginationMeta(count, p, l),
  });
});

// ─── Admin: Update Order Status ──────────────────────────────────────────────────
export const updateOrderStatus = AsyncWrapper(async (req, res, next) => {
  const { orderId } = req.params;
  const { orderStatus, paymentStatus, trackingNumber } = req.body;

  const order = await Order.findByPk(orderId);
  if (!order) {
    return next(new ErrorHandler("Order not found", 404));
  }

  if (orderStatus) order.orderStatus = orderStatus;
  if (paymentStatus) order.paymentStatus = paymentStatus;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (orderStatus === ORDER_STATUS.delivered) order.deliveredAt = new Date();

  await order.save();

  // Notify customer
  await Notification.create({
    userId: order.userId,
    type: NOTIFICATION_TYPE.order,
    title: "Order Status Updated",
    message: `Your order #${order.orderNumber} status is now: ${order.orderStatus}`,
    referenceId: order.orderId,
    referenceType: "order",
  });

  return SuccessMessage(res, "Order status updated successfully", order);
});
