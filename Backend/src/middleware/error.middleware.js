import logger from "../utils/logger.js";

export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Async wrapper — eliminates try/catch boilerplate in every controller.
 * Usage: router.get("/", asyncHandler(myController))
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Global error handler — must be the last app.use() in server.js.
 */
export const errorHandler = (err, req, res, next) => {
  // Zod validation errors
  if (err.name === "ZodError") {
    return res.status(400).json({
      success: false,
      message: "Validation failed.",
      errors: err.flatten?.().fieldErrors ?? err.issues,
    });
  }

  // Prisma unique constraint violation
  if (err.code === "P2002") {
    const field = err.meta?.target?.[0] ?? "field";
    return res.status(409).json({
      success: false,
      message: `A record with this ${field} already exists.`,
    });
  }

  // Prisma record not found
  if (err.code === "P2025") {
    return res.status(404).json({
      success: false,
      message: "Record not found.",
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }

  // Operational / known errors
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Unknown errors — don't leak internals
  logger.error(err);
  return res.status(500).json({
    success: false,
    message: "Internal Server Error.",
  });
};