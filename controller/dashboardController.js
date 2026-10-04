import { Op } from "sequelize";
import { sequelize } from "../config/dbConnect.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import OrderItem from "../models/OrderItem.js";
import { USER_ROLES, ORDER_STATUS, PAYMENT_STATUS } from "../config/constants.js";

// @desc    Get dashboard overview stats
// @route   GET /api/v1/dashboard/overview
// @access  Private/Admin
export const getDashboardOverview = async (req, res, next) => {
  try {
    const totalCustomers = await User.count({
      where: { role: USER_ROLES.customer },
    });

    const totalProducts = await Product.count();

    const totalOrders = await Order.count();

    // Calculate total revenue from non-cancelled/refunded orders that are paid
    const revenueResult = await Order.sum("totalAmount", {
      where: {
        orderStatus: {
          [Op.notIn]: [ORDER_STATUS.cancelled, ORDER_STATUS.refunded],
        },
        paymentStatus: PAYMENT_STATUS.paid,
      },
    });
    
    const totalRevenue = revenueResult || 0;

    res.status(200).json({
      success: true,
      data: {
        totalCustomers,
        totalProducts,
        totalOrders,
        totalRevenue: parseFloat(totalRevenue),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sales analytics (last 30 days)
// @route   GET /api/v1/dashboard/analytics
// @access  Private/Admin
export const getSalesAnalytics = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const salesData = await Order.findAll({
      attributes: [
        [sequelize.fn("DATE", sequelize.col("createdAt")), "date"],
        [sequelize.fn("SUM", sequelize.col("totalAmount")), "revenue"],
        [sequelize.fn("COUNT", sequelize.col("orderId")), "orders"],
      ],
      where: {
        createdAt: {
          [Op.gte]: thirtyDaysAgo,
        },
        orderStatus: {
          [Op.notIn]: [ORDER_STATUS.cancelled, ORDER_STATUS.refunded],
        },
        paymentStatus: PAYMENT_STATUS.paid,
      },
      group: [sequelize.fn("DATE", sequelize.col("createdAt"))],
      order: [[sequelize.fn("DATE", sequelize.col("createdAt")), "ASC"]],
    });

    res.status(200).json({
      success: true,
      data: salesData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent orders
// @route   GET /api/v1/dashboard/recent-orders
// @access  Private/Admin
export const getRecentOrders = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const recentOrders = await Order.findAll({
      limit,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          as: "user",
          attributes: ["userId", "firstName", "lastName", "email", "avatar"],
        },
      ],
      attributes: ["orderId", "orderNumber", "totalAmount", "orderStatus", "paymentStatus", "createdAt"],
    });

    res.status(200).json({
      success: true,
      data: recentOrders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get top selling products
// @route   GET /api/v1/dashboard/top-products
// @access  Private/Admin
export const getTopProducts = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const topProducts = await OrderItem.findAll({
      attributes: [
        "productId",
        "productName",
        "productImage",
        [sequelize.fn("SUM", sequelize.col("quantity")), "totalSold"],
        [sequelize.fn("SUM", sequelize.col("totalPrice")), "totalRevenue"],
      ],
      group: ["productId", "productName", "productImage"],
      order: [[sequelize.literal("totalSold"), "DESC"]],
      limit,
    });

    res.status(200).json({
      success: true,
      data: topProducts,
    });
  } catch (error) {
    next(error);
  }
};
