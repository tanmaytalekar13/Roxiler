import { z } from "zod";

// Shared password rule — DRY
const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,16}$/;

export const passwordSchema = z
  .string()
  .regex(
    passwordRegex,
    "Password must be 8–16 characters and include at least one uppercase letter and one special character."
  );

// ── Public signup ─────────────────────────────────────────────────────────────
export const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(20, "Name must be at least 20 characters.")
    .max(60, "Name cannot exceed 60 characters."),
  email: z.string().trim().email("Invalid email address."),
  address: z.string().trim().max(400, "Address cannot exceed 400 characters."),
  password: passwordSchema,
});

// ── Login ─────────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address."),
  password: z.string().min(1, "Password is required."),
});

// ── Change password ───────────────────────────────────────────────────────────
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: passwordSchema,
});

// ── Admin: create user ────────────────────────────────────────────────────────
export const createUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(20, "Name must be at least 20 characters.")
    .max(60, "Name cannot exceed 60 characters."),
  email: z.string().trim().email("Invalid email address."),
  password: passwordSchema,
  address: z.string().trim().max(400, "Address cannot exceed 400 characters."),
  role: z.enum(["ADMIN", "USER", "OWNER"]),
});

// ── Admin: create store ───────────────────────────────────────────────────────
export const createStoreSchema = z.object({
  name: z.string().trim().min(3, "Store name must be at least 3 characters.").max(100),
  email: z.string().trim().email("Invalid email address."),
  address: z.string().trim().min(1, "Address is required.").max(400),
  ownerId: z.number().int().positive("Owner ID must be a positive integer."),
});