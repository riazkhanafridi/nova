import express from "express";
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../controller/notificationController.js";
import auth from "../middlewares/Auth.js";

const router = express.Router();

// All notification routes require authentication
router.use(auth);

router.get("/", getMyNotifications);
router.patch("/:notificationId/read", markAsRead);
router.patch("/read-all", markAllAsRead);
router.delete("/:notificationId", deleteNotification);

export default router;
