import jwt from "jsonwebtoken";

/**
 * Short-lived access token stored in memory on the client (or HttpOnly cookie).
 */
export const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
};

/**
 * Long-lived refresh token stored in an HttpOnly cookie.
 * Used to silently obtain new access tokens without re-login.
 */
export const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
};

/**
 * Cookie options shared across set/clear calls.
 */
export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  path: "/",
};

export const ACCESS_COOKIE_TTL = 15 * 60 * 1000;          // 15 min
export const REFRESH_COOKIE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days