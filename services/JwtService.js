import jwt from "jsonwebtoken";
import envVariables from "../config/constants.js";
import User from "../models/User.js";

const { accessTokenSecret, refreshTokenSecret } = envVariables;

// Generate tokens
export const generateTokens = (payload) => {
  const accessToken = jwt.sign(payload, accessTokenSecret, { expiresIn: "24h" });
  const refreshToken = jwt.sign(payload, refreshTokenSecret, { expiresIn: "30d" });
  return { accessToken, refreshToken };
};

// Store only refresh token in DB
export const storeTokens = async (refreshToken, userId) => {
  return await User.update({ refreshToken }, { where: { userId } });
};

// Verify access token (stateless)
export const verifyAccessToken = (token) => {
  return jwt.verify(token, accessTokenSecret);
};

// Verify refresh token (checks DB)
export const verifyRefreshToken = async (token) => {
  try {
    const decoded = jwt.verify(token, refreshTokenSecret);
    const user = await User.findOne({
      where: { userId: decoded.userId, refreshToken: token },
    });
    if (!user) throw Object.assign(new Error("user_not_found"), { statusCode: 401 });
    return user;
  } catch (error) {
    if (error.name === "TokenExpiredError") error.message = "Refresh token expired";
    else if (error.message === "user_not_found") error.message = "Invalid refresh token";
    else error.message = "Token invalid";
    throw error;
  }
};
