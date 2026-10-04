import express from "express";
import {
  registerAdmin,
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  verifyOTP,
  resetPassword,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../controller/authController.js";
import auth from "../middlewares/Auth.js";
import roleAuthorization from "../middlewares/roleAuthorization.js";
import { setUploadFolder, upload } from "../middlewares/upload.js";
import { USER_ROLES } from "../config/constants.js";

const router = express.Router();

// Public routes
router.post("/register-admin", registerAdmin);
router.post("/admin/register", registerAdmin);
router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);

// Protected routes (Customer & Admin)
router.use(auth);
router.post("/logout", logout);
router.get("/profile", getProfile);
router.patch("/profile", setUploadFolder("avatars"), upload.single("avatar"), updateProfile);
router.post("/change-password", changePassword);

// Admin only routes
router.use(roleAuthorization([USER_ROLES.admin]));
router.get("/users", getAllUsers);
router.post("/users", createUser);
router.patch("/users/:userId", updateUser);
router.delete("/users/:userId", deleteUser);

export default router;
