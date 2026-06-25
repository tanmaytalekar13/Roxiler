import prisma from "../config/prisma.js";
import { submitRatingSchema, updateRatingSchema } from "../validators/rating.validator.js";
import { asyncHandler, AppError } from "../middleware/error.middleware.js";

// ── Submit Rating ─────────────────────────────────────────────────────────────
export const submitRating = asyncHandler(async (req, res) => {
  const { storeId, rating } = submitRatingSchema.parse(req.body);
  const userId = req.user.id;

  // Use a transaction so the store-existence check and insert are atomic
  const newRating = await prisma.$transaction(async (tx) => {
    const store = await tx.store.findUnique({ where: { id: storeId } });
    if (!store) throw new AppError("Store not found.", 404);

    const existing = await tx.rating.findUnique({
      where: { userId_storeId: { userId, storeId } },
    });
    if (existing) throw new AppError("You have already rated this store.", 409);

    return tx.rating.create({ data: { rating, userId, storeId } });
  });

  return res.status(201).json({
    success: true,
    message: "Rating submitted successfully.",
    data: newRating,
  });
});

// ── Update Rating ─────────────────────────────────────────────────────────────
export const updateRating = asyncHandler(async (req, res) => {
  const ratingId = Number(req.params.id);
  if (isNaN(ratingId) || ratingId < 1) throw new AppError("Invalid rating ID.", 400);

  const { rating } = updateRatingSchema.parse(req.body);
  const userId = req.user.id;

  const existing = await prisma.rating.findUnique({ where: { id: ratingId } });
  if (!existing) throw new AppError("Rating not found.", 404);
  if (existing.userId !== userId) throw new AppError("Unauthorized.", 403);

  const updated = await prisma.rating.update({
    where: { id: ratingId },
    data: { rating },
  });

  return res.status(200).json({
    success: true,
    message: "Rating updated successfully.",
    data: updated,
  });
});