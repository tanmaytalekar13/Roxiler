import { z } from "zod";

const ratingValue = z
  .number({ invalid_type_error: "Rating must be a number." })
  .int("Rating must be an integer.")
  .min(1, "Rating must be at least 1.")
  .max(5, "Rating cannot exceed 5.");

export const submitRatingSchema = z.object({
  storeId: z.number().int().positive("Store ID must be a positive integer."),
  rating: ratingValue,
});

export const updateRatingSchema = z.object({
  rating: ratingValue,
});