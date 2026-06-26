import prisma from "../config/prisma.js";
import { calculateAverageRating } from "../utils/calculateAverageRating.js";
import { asyncHandler } from "../middleware/error.middleware.js";

export const getStores = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const {
    page = "1",
    limit = "10",
    search = "",
    sortBy = "createdAt",
    order = "desc",
  } = req.query;

  const pageNumber = Math.max(1, Number(page));
  const limitNumber = Math.min(100, Math.max(1, Number(limit)));

  const allowedSortFields = ["name", "address", "createdAt"];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
  const sortOrder = order === "asc" ? "asc" : "desc";

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { address: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  const [stores, total] = await Promise.all([
    prisma.store.findMany({
      where,
      include: {
        ratings: {
          select: {
            id: true,       // ← FIX: needed so frontend can call PUT /ratings/:id
            rating: true,
            userId: true,
          },
        },
      },
      orderBy: { [sortField]: sortOrder },
      skip: (pageNumber - 1) * limitNumber,
      take: limitNumber,
    }),
    prisma.store.count({ where }),
  ]);

  const formattedStores = stores.map((store) => {
    const { averageRating, totalRatings } = calculateAverageRating(store.ratings);
    const userRatingEntry = store.ratings.find((r) => r.userId === userId);

    return {
      id: store.id,
      name: store.name,
      address: store.address,
      overallRating: averageRating,
      totalRatings,
      // ← FIX: return object so frontend has the id for update calls
      userRating: userRatingEntry
        ? { id: userRatingEntry.id, rating: userRatingEntry.rating }
        : null,
    };
  });

  return res.status(200).json({
    success: true,
    data: {
      stores: formattedStores,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    },
  });
});