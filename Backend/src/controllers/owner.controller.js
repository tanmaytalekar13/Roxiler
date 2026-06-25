import prisma from "../config/prisma.js";
import { asyncHandler, AppError } from "../middleware/error.middleware.js";
import { calculateAverageRating } from "../utils/calculateAverageRating.js";

export const getOwnerDashboard = asyncHandler(async (req, res) => {
  const ownerId = req.user.id;

  const store = await prisma.store.findUnique({
    where: { ownerId },
    include: {
      ratings: {
        include: {
          user: {
            select: { id: true, name: true, email: true, address: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!store) throw new AppError("Store not found.", 404);

  const { averageRating, totalRatings } = calculateAverageRating(store.ratings);

  const users = store.ratings.map((item) => ({
    id: item.user.id,
    name: item.user.name,
    email: item.user.email,
    address: item.user.address,
    rating: item.rating,
    submittedAt: item.createdAt,
  }));

  return res.status(200).json({
    success: true,
    data: {
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        averageRating,
        totalRatings,
      },
      users,
    },
  });
});