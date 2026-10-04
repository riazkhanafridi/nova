import ErrorHandler from "../utils/errorHandler.js";

const roleAuthorization = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return next(new ErrorHandler("Unauthorized", 401));
    }

    if (allowedRoles.includes(userRole)) {
      next();
    } else {
      return next(new ErrorHandler("Access denied. Insufficient permissions.", 403));
    }
  };
};

export default roleAuthorization;
