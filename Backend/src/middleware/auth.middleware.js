import jwt from "jsonwebtoken";
import { AppError } from "./error.middleware.js";

/**
 * Reads the access token from:
 *   1. Authorization: Bearer <token>  (for SPA / mobile clients)
 *   2. HttpOnly cookie `accessToken`  (for browser-based persistent login)
 */
const authenticate = (req, res, next) => {
  try {
    let token;

    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new AppError("Access denied. No token provided.", 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};

export default authenticate;