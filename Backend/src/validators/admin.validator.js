export const createStoreSchema = z.object({
  name: z
    .string()
    .min(3, "Store name is required")
    .max(100),

  email: z.email("Invalid email"),

  address: z
    .string()
    .min(1)
    .max(400),

  ownerId: z.number().int().positive(),
});