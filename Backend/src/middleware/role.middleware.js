import { AppError } from "./error.middleware.js";

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Unauthorized. Please log in first.", 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError("Access denied. You do not have permission to perform this action.", 403)
      );
    }

    next();
  };
};

export default authorize;