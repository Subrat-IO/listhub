import { z } from "zod";

const decimal = z.union([z.number(), z.string()]).transform((v) => String(v));

export const createListingSchema = z.object({
  categoryId: z.string().uuid(),
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(20000),
  askingPrice: decimal,
  currency: z.string().length(3).default("USD"),
  location: z.string().max(200).optional(),
  imageUrls: z.array(z.string().url()).max(12).default([]),
  fees: z
    .array(
      z.object({
        label: z.string().min(1).max(120),
        amount: decimal,
        currency: z.string().length(3).default("USD"),
      })
    )
    .max(20)
    .default([]),
  terms: z.array(z.string().min(1).max(5000)).max(20).default([]),
  attributes: z
    .record(z.string().uuid(), z.string().max(2000))
    .optional()
    .default({}),
});

export const updateListingSchema = createListingSchema.partial().extend({
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "SOLD", "REMOVED"]).optional(),
  featured: z.boolean().optional(),
});
