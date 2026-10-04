import bcrypt from "bcrypt";
import SuccessMessage from "../utils/SuccessMessage.js";
import ErrorHandler from "../utils/errorHandler.js";
import AsyncWrapper from "../utils/asyncWrapper.js";
import { Op } from "sequelize";
import User from "../models/User.js";
import { USER_ROLES, USER_STATUS } from "../config/constants.js";
import { generateTokens, storeTokens, verifyRefreshToken } from "../services/JwtService.js";
import { generateOTP } from "../utils/helpers.js";
import envVariables from "../config/constants.js";

// ─── Register Admin (one-time seed) ────────────────────────────────────────────
export const registerAdmin = AsyncWrapper(async (req, res, next) => {
  const adminExists = await User.findOne({ where: { role: USER_ROLES.admin } });
  if (adminExists) {
    return next(new ErrorHandler("Admin account already exists", 400));
  }

  const {
    fullName = "Nova Admin",
    email = "admin@nova.com",
    password: rawPassword = "Admin@1234",
  } = req.body;

  if (rawPassword.length < 8) {
    return next(new ErrorHandler("Password must be at least 8 characters long", 422));
  }

  const password = await bcrypt.hash(rawPassword, 10);
  const admin = await User.create({
    fullName,
    email,
    password,
    role: USER_ROLES.admin,
    status: USER_STATUS.active,
    isEmailVerified: true,
  });
  

  return SuccessMessage(res, "Admin account created successfully", {
    userId: admin.userId,
    email: admin.email,
    role: admin.role,
  });
});

// ─── Register Customer ──────────────────────────────────────────────────────────
export const register = AsyncWrapper(async (req, res, next) => {
  const { fullName, email, phone, password } = req.body;

  if (!fullName || !email || !password) {
    return next(new ErrorHandler("Full name, email and password are required", 400));
  }

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    return next(new ErrorHandler("Email already registered", 409));
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    fullName,
    email,
    phone: phone || null,
    password: hashedPassword,
    role: USER_ROLES.customer,
    status: USER_STATUS.active,
  });

  const { accessToken, refreshToken } = generateTokens({
    userId: user.userId,
    role: user.role,
  });

  await storeTokens(refreshToken, user.userId);

  return SuccessMessage(
    res,
    "Account created successfully",
    {
      user: {
        userId: user.userId,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      accessToken,
      refreshToken,
    },
    201
  );
});

// ─── Login ──────────────────────────────────────────────────────────────────────
export const login = AsyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Email and password are required", 400));
  }

  const user = await User.findOne({ where: { email } });
  if (!user) {
    return next(new ErrorHandler("Incorrect email or password", 403));
  }

  // Account lock check
  if (user.lockUntil && user.lockUntil > new Date()) {
    const unlockTime = user.lockUntil.toLocaleString();
    return next(new ErrorHandler(`Account is locked. Try again after: ${unlockTime}`, 400));
  }

  // Password check
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    user.passwordRetries += 1;
    if (user.passwordRetries >= envVariables.maxPasswordAttempts) {
      user.lockUntil = new Date(Date.now() + 10 * 60 * 60 * 1000); // 10 hours
    }
    await user.save();
    return next(new ErrorHandler("Incorrect email or password", 422));
  }

  if (user.status === USER_STATUS.blocked) {
    return next(new ErrorHandler("Your account has been blocked by admin", 403));
  }

  // Reset retries
  user.passwordRetries = 0;
  user.lockUntil = null;
  user.last_login = new Date();
  await user.save();

  const { accessToken, refreshToken } = generateTokens({
    userId: user.userId,
    role: user.role,
  });

  await storeTokens(refreshToken, user.userId);

  return SuccessMessage(res, "Logged in successfully", {
    user: {
      userId: user.userId,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      status: user.status,
      last_login: user.last_login,
    },
    accessToken,
    refreshToken,
  });
});

// ─── Refresh Token ──────────────────────────────────────────────────────────────
export const refreshToken = AsyncWrapper(async (req, res, next) => {
  const { refreshToken: token } = req.body;

  if (!token) {
    return next(new ErrorHandler("Refresh token is required", 400));
  }

  const user = await verifyRefreshToken(token);

  const { accessToken, refreshToken: newRefreshToken } = generateTokens({
    userId: user.userId,
    role: user.role,
  });

  await storeTokens(newRefreshToken, user.userId);

  return SuccessMessage(res, "Token refreshed successfully", {
    accessToken,
    refreshToken: newRefreshToken,
  });
});

// ─── Logout ─────────────────────────────────────────────────────────────────────
export const logout = AsyncWrapper(async (req, res, next) => {
  await User.update({ refreshToken: null }, { where: { userId: req.user.userId } });
  return SuccessMessage(res, "Logged out successfully");
});

// ─── Get Profile ────────────────────────────────────────────────────────────────
export const getProfile = AsyncWrapper(async (req, res, next) => {
  const user = await User.findByPk(req.user.userId, {
    attributes: { exclude: ["password", "refreshToken", "email_otp", "email_otp_expires"] },
  });

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  return SuccessMessage(res, "Profile fetched successfully", user);
});

// ─── Update Profile ─────────────────────────────────────────────────────────────
export const updateProfile = AsyncWrapper(async (req, res, next) => {
  const { fullName, phone } = req.body;
  const user = await User.findByPk(req.user.userId);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  if (fullName) user.fullName = fullName;
  if (phone) user.phone = phone;
  if (req.file) user.avatar = `/uploads/avatars/${req.file.filename}`;

  await user.save();

  return SuccessMessage(res, "Profile updated successfully", {
    userId: user.userId,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    avatar: user.avatar,
  });
});

// ─── Change Password ────────────────────────────────────────────────────────────
export const changePassword = AsyncWrapper(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new ErrorHandler("Current password and new password are required", 400));
  }

  const user = await User.findByPk(req.user.userId);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) {
    return next(new ErrorHandler("Current password is incorrect", 401));
  }

  if (newPassword.length < 8) {
    return next(new ErrorHandler("Password must be at least 8 characters long", 422));
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  return SuccessMessage(res, "Password changed successfully");
});

// ─── Forgot Password ────────────────────────────────────────────────────────────
export const forgotPassword = AsyncWrapper(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ErrorHandler("Email is required", 400));
  }

  const user = await User.findOne({ where: { email } });
  if (!user) {
    return next(new ErrorHandler("No account with that email exists", 404));
  }

  const otp = generateOTP();
  user.email_otp = otp;
  user.email_otp_expires = Date.now() + 3600000; // 1 hour
  await user.save();

  // TODO: Send OTP via email service
  console.log(`🔑 OTP for ${email}: ${otp}`);

  return SuccessMessage(res, "OTP sent to your email. Please check your inbox.");
});

// ─── Verify OTP ─────────────────────────────────────────────────────────────────
export const verifyOTP = AsyncWrapper(async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return next(new ErrorHandler("Email and OTP are required", 400));
  }

  const user = await User.findOne({ where: { email } });
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  if (!user.email_otp || !user.email_otp_expires) {
    return next(new ErrorHandler("No OTP found. Please request a new one", 400));
  }

  if (Date.now() > user.email_otp_expires) {
    user.email_otp = null;
    user.email_otp_expires = null;
    await user.save();
    return next(new ErrorHandler("OTP has expired. Please request a new one", 400));
  }

  if (user.email_otp !== otp) {
    return next(new ErrorHandler("Invalid OTP. Please try again", 400));
  }

  user.email_otp = null;
  user.email_otp_expires = null;
  await user.save();

  return SuccessMessage(res, "OTP verified successfully");
});

// ─── Reset Password ─────────────────────────────────────────────────────────────
export const resetPassword = AsyncWrapper(async (req, res, next) => {
  const { email, newPassword, confirmPassword } = req.body;

  if (!email || !newPassword || !confirmPassword) {
    return next(new ErrorHandler("All fields are required", 400));
  }

  if (newPassword !== confirmPassword) {
    return next(new ErrorHandler("Passwords do not match", 422));
  }

  if (newPassword.length < 8) {
    return next(new ErrorHandler("Password must be at least 8 characters long", 422));
  }

  const user = await User.findOne({ where: { email } });
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.passwordRetries = 0;
  user.lockUntil = null;
  await user.save();

  return SuccessMessage(res, "Password reset successfully");
});

// ─── Admin: Get All Users ───────────────────────────────────────────────────────
export const getAllUsers = AsyncWrapper(async (req, res, next) => {
  const { page = 1, limit = 20, search, status, role } = req.query;
  const offset = (page - 1) * limit;

  const where = {};
  if (search) {
    where[Op.or] = [
      { fullName: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
    ];
  }
  if (status) where.status = status;
  if (role) where.role = role;

  const { count, rows } = await User.findAndCountAll({
    where,
    attributes: { exclude: ["password", "refreshToken", "email_otp", "email_otp_expires"] },
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [["createdAt", "DESC"]],
  });

  return SuccessMessage(res, "Users fetched successfully", {
    users: rows,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit),
    },
  });
});

// ─── Admin: Create User ─────────────────────────────────────────────────────────
export const createUser = AsyncWrapper(async (req, res, next) => {
  const { fullName, email, phone, password, role, status } = req.body;

  if (!fullName || !email || !password || !role) {
    return next(new ErrorHandler("fullName, email, password and role are required", 400));
  }

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    return next(new ErrorHandler("Email already exists", 409));
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    fullName, email, phone, password: hashedPassword,
    role, status: status || USER_STATUS.active,
  });

  return SuccessMessage(res, "User created successfully", {
    userId: user.userId, fullName: user.fullName, email: user.email,
    phone: user.phone, role: user.role, status: user.status,
  }, 201);
});

// ─── Admin: Update User ─────────────────────────────────────────────────────────
export const updateUser = AsyncWrapper(async (req, res, next) => {
  const { userId } = req.params;
  const { fullName, email, phone, role, status } = req.body;

  const user = await User.findByPk(userId);
  if (!user) {
    return next(new ErrorHandler(`No user found with id: ${userId}`, 404));
  }

  if (email && email !== user.email) {
    const emailExists = await User.findOne({
      where: { email, userId: { [Op.ne]: userId } },
    });
    if (emailExists) {
      return next(new ErrorHandler("Email already exists", 409));
    }
  }

  const fields = { fullName, email, phone, role, status };
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined) user[key] = value;
  });

  await user.save();

  return SuccessMessage(res, "User updated successfully", {
    userId: user.userId, fullName: user.fullName, email: user.email,
    role: user.role, status: user.status,
  });
});

// ─── Admin: Delete User ─────────────────────────────────────────────────────────
export const deleteUser = AsyncWrapper(async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findByPk(userId);
  if (!user) {
    return next(new ErrorHandler(`No user found with id: ${userId}`, 404));
  }

  await user.destroy();
  return SuccessMessage(res, "User deleted successfully");
});
