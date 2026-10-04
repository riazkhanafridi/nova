import ErrorHandler from "../utils/errorHandler.js";
import { verifyAccessToken } from "../services/JwtService.js";

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new ErrorHandler("Token not provided", 401));
    }

    const accessToken = authHeader.split(" ")[1];

    if (!accessToken || accessToken === "undefined") {
      return next(new ErrorHandler("Invalid token", 401));
    }

    const userData = verifyAccessToken(accessToken);
    req.user = userData;
    next();
  } catch (error) {
    return next(new ErrorHandler(error?.message || "Unauthorized", 401));
  }
};

export default auth;
