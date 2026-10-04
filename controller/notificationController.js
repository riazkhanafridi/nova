import SuccessMessage from "../utils/SuccessMessage.js";
import ErrorHandler from "../utils/errorHandler.js";
import AsyncWrapper from "../utils/asyncWrapper.js";
import Notification from "../models/Notification.js";
import { getPagination, getPaginationMeta } from "../utils/helpers.js";

// ─── Get My Notifications ────────────────────────────────────────────────────────
export const getMyNotifications = AsyncWrapper(async (req, res, next) => {
  const { page = 1, limit = 20, unreadOnly } = req.query;
  const { offset, page: p, limit: l } = getPagination(page, limit);

  const where = { userId: req.user.userId };
  if (unreadOnly === "true") where.isRead = false;

  const { count, rows } = await Notification.findAndCountAll({
    where,
    limit: l,
    offset,
    order: [["createdAt", "DESC"]],
  });

  const unreadCount = await Notification.count({
    where: { userId: req.user.userId, isRead: false },
  });

  return SuccessMessage(res, "Notifications fetched", {
    notifications: rows,
    unreadCount,
    pagination: getPaginationMeta(count, p, l),
  });
});

// ─── Mark Notification as Read ───────────────────────────────────────────────────
export const markAsRead = AsyncWrapper(async (req, res, next) => {
  const { notificationId } = req.params;

  const notification = await Notification.findOne({
    where: { notificationId, userId: req.user.userId },
  });

  if (!notification) {
    return next(new ErrorHandler("Notification not found", 404));
  }

  notification.isRead = true;
  await notification.save();

  return SuccessMessage(res, "Notification marked as read");
});

// ─── Mark All as Read ────────────────────────────────────────────────────────────
export const markAllAsRead = AsyncWrapper(async (req, res, next) => {
  await Notification.update(
    { isRead: true },
    { where: { userId: req.user.userId, isRead: false } }
  );

  return SuccessMessage(res, "All notifications marked as read");
});

// ─── Delete Notification ─────────────────────────────────────────────────────────
export const deleteNotification = AsyncWrapper(async (req, res, next) => {
  const { notificationId } = req.params;

  const notification = await Notification.findOne({
    where: { notificationId, userId: req.user.userId },
  });

  if (!notification) {
    return next(new ErrorHandler("Notification not found", 404));
  }

  await notification.destroy();
  return SuccessMessage(res, "Notification deleted successfully");
});
