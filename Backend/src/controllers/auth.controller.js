import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";
import {
  generateAccessToken,
  generateRefreshToken,
  cookieOptions,
  ACCESS_COOKIE_TTL,
  REFRESH_COOKIE_TTL,
} from "../utils/generateToken.js";
import {
  signupSchema,
  loginSchema,
  changePasswordSchema,
} from "../validators/auth.validator.js";
import { asyncHandler, AppError } from "../middleware/error.middleware.js";

// ── Helpers ───────────────────────────────────────────────────────────────────
const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: ACCESS_COOKIE_TTL,
  });
  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: REFRESH_COOKIE_TTL,
  });
};

const clearAuthCookies = (res) => {
  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);
};

const safeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});

// ── SIGNUP ────────────────────────────────────────────────────────────────────
export const signup = asyncHandler(async (req, res) => {
  const { name, email, password, address } = signupSchema.parse(req.body);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError("Email already registered.", 409);

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, address },
  });

  return res.status(201).json({
    success: true,
    message: "User registered successfully.",
    data: safeUser(user),
  });
});

// ── LOGIN ─────────────────────────────────────────────────────────────────────
export const login = asyncHandler(async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email } });
  const isMatch = user ? await bcrypt.compare(password, user.password) : false;

  // Constant-time response prevents user enumeration
  if (!user || !isMatch) {
    throw new AppError("Invalid email or password.", 401);
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  setAuthCookies(res, accessToken, refreshToken);

  return res.status(200).json({
    success: true,
    message: "Login successful.",
    // Also send accessToken in body so SPA can store in memory
    data: { accessToken, user: safeUser(user) },
  });
});

// ── REFRESH TOKEN ─────────────────────────────────────────────────────────────
export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw new AppError("No refresh token provided.", 401);

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  } catch {
    throw new AppError("Invalid or expired refresh token.", 401);
  }

  // Ensure user still exists (not deleted)
  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  if (!user) throw new AppError("User no longer exists.", 401);

  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  setAuthCookies(res, newAccessToken, newRefreshToken);

  return res.status(200).json({
    success: true,
    message: "Token refreshed.",
    data: { accessToken: newAccessToken, user: safeUser(user) },
  });
});

// ── CHANGE PASSWORD ───────────────────────────────────────────────────────────
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) throw new AppError("User not found.", 404);

  const isCorrect = await bcrypt.compare(currentPassword, user.password);
  if (!isCorrect) throw new AppError("Current password is incorrect.", 400);

  if (currentPassword === newPassword) {
    throw new AppError("New password must differ from current password.", 400);
  }

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: req.user.id },
    data: { password: hashed },
  });

  // Rotate tokens so existing sessions are invalidated
  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);
  setAuthCookies(res, newAccessToken, newRefreshToken);

  return res.status(200).json({
    success: true,
    message: "Password updated successfully.",
  });
});

// ── LOGOUT ────────────────────────────────────────────────────────────────────
export const logout = asyncHandler(async (req, res) => {
  clearAuthCookies(res);
  return res.status(200).json({ success: true, message: "Logout successful." });
});

// ── ME (re-hydrate session on page load) ─────────────────────────────────────
export const getMe = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true, role: true },
  });
  if (!user) throw new AppError("User not found.", 404);
  return res.status(200).json({ success: true, data: user });
});