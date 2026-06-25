import bcrypt from "bcrypt";
import prisma from "../config/prisma.js";
import { createUserSchema, createStoreSchema } from "../validators/auth.validator.js";
import { asyncHandler, AppError } from "../middleware/error.middleware.js";
import { calculateAverageRating } from "../utils/calculateAverageRating.js";

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const getDashboard = asyncHandler(async (req, res) => {
  const [totalUsers, totalStores, totalRatings] = await Promise.all([
    prisma.user.count(),
    prisma.store.count(),
    prisma.rating.count(),
  ]);

  return res.status(200).json({
    success: true,
    data: { totalUsers, totalStores, totalRatings },
  });
});

// ── Add User ──────────────────────────────────────────────────────────────────
export const addUser = asyncHandler(async (req, res) => {
  const { name, email, password, address, role } = createUserSchema.parse(req.body);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError("Email already exists.", 409);

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, address, role },
    select: { id: true, name: true, email: true, role: true },
  });

  return res.status(201).json({
    success: true,
    message: "User created successfully.",
    data: user,
  });
});

// ── Add Store ─────────────────────────────────────────────────────────────────
export const addStore = asyncHandler(async (req, res) => {
  const { name, email, address, ownerId } = createStoreSchema.parse(req.body);

  const owner = await prisma.user.findUnique({ where: { id: ownerId } });
  if (!owner) throw new AppError("Owner not found.", 404);
  if (owner.role !== "OWNER") throw new AppError("Selected user is not a Store Owner.", 400);

  // Both checks in parallel — safe because they are independent reads
  const [existingStore, emailExists] = await Promise.all([
    prisma.store.findUnique({ where: { ownerId } }),
    prisma.store.findUnique({ where: { email } }),
  ]);

  if (existingStore) throw new AppError("Owner already has a store.", 409);
  if (emailExists) throw new AppError("Store email already in use.", 409);

  const store = await prisma.store.create({
    data: { name, email, address, ownerId },
  });

  return res.status(201).json({
    success: true,
    message: "Store created successfully.",
    data: store,
  });
});

// ── Get Users ─────────────────────────────────────────────────────────────────
export const getUsers = asyncHandler(async (req, res) => {
  const {
    page = "1",
    limit = "10",
    search = "",
    role,
    sortBy = "createdAt",
    order = "desc",
  } = req.query;

  const pageNumber = Math.max(1, Number(page));
  const limitNumber = Math.min(100, Math.max(1, Number(limit)));

  const allowedSortFields = ["name", "email", "address", "role", "createdAt"];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
  const sortOrder = order === "asc" ? "asc" : "desc";

  const allowedRoles = ["ADMIN", "USER", "OWNER"];
  const roleFilter = role && allowedRoles.includes(role) ? role : undefined;

  const where = {
    AND: [
      search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { address: { contains: search, mode: "insensitive" } },
            ],
          }
        : {},
      roleFilter ? { role: roleFilter } : {},
    ],
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, address: true, role: true, createdAt: true },
      orderBy: { [sortField]: sortOrder },
      skip: (pageNumber - 1) * limitNumber,
      take: limitNumber,
    }),
    prisma.user.count({ where }),
  ]);

  return res.status(200).json({
    success: true,
    data: {
      users,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    },
  });
});

// ── Get Stores ────────────────────────────────────────────────────────────────
export const getStores = asyncHandler(async (req, res) => {
  const {
    page = "1",
    limit = "10",
    search = "",
    sortBy = "createdAt",
    order = "desc",
  } = req.query;

  const pageNumber = Math.max(1, Number(page));
  const limitNumber = Math.min(100, Math.max(1, Number(limit)));

  const allowedSortFields = ["name", "email", "address", "createdAt"];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
  const sortOrder = order === "asc" ? "asc" : "desc";

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { address: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  const [stores, total] = await Promise.all([
    prisma.store.findMany({
      where,
      include: { ratings: { select: { rating: true } } },
      orderBy: { [sortField]: sortOrder },
      skip: (pageNumber - 1) * limitNumber,
      take: limitNumber,
    }),
    prisma.store.count({ where }),
  ]);

  const formattedStores = stores.map((store) => {
    const { averageRating, totalRatings } = calculateAverageRating(store.ratings);
    return {
      id: store.id,
      name: store.name,
      email: store.email,
      address: store.address,
      averageRating,
      totalRatings,
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

// ── Get User By ID ────────────────────────────────────────────────────────────
export const getUserById = asyncHandler(async (req, res) => {
  const userId = Number(req.params.id);
  if (isNaN(userId) || userId < 1) throw new AppError("Invalid user ID.", 400);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, address: true, role: true },
  });

  if (!user) throw new AppError("User not found.", 404);

  if (user.role !== "OWNER") {
    return res.status(200).json({ success: true, data: user });
  }

  // Owner — attach store + average rating
  const store = await prisma.store.findUnique({
    where: { ownerId: userId },
    include: { ratings: { select: { rating: true } } },
  });

  if (!store) {
    return res.status(200).json({ success: true, data: { ...user, store: null } });
  }

  const { averageRating, totalRatings } = calculateAverageRating(store.ratings);

  return res.status(200).json({
    success: true,
    data: {
      ...user,
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        averageRating,
        totalRatings,
      },
    },
  });
});