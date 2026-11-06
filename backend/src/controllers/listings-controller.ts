import type { Request, Response } from "express";
import { InterestStatus, ListingStatus, Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { createListingSchema, updateListingSchema } from "../validators/listing-validators.js";
import { writeAuditLog } from "../utils/audit.js";

const listQuery = z.object({
  q: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  location: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  featured: z
    .union([z.literal("true"), z.literal("false")])
    .optional()
    .transform((v) => (v === "true" ? true : v === "false" ? false : undefined)),
  status: z.enum(["ACTIVE", "DRAFT", "PAUSED", "SOLD", "REMOVED", "REJECTED"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

const interestBody = z.object({
  message: z.string().max(2000).optional(),
  acceptedTerms: z.boolean(),
});

function listingInclude() {
  return {
    category: true,
    seller: { include: { profile: true } },
    images: { orderBy: { sortOrder: "asc" as const } },
    fees: true,
    terms: { orderBy: { sortOrder: "asc" as const } },
    attributes: { include: { categoryAttribute: true } },
  } satisfies Prisma.ListingInclude;
}

export async function getListings(req: Request, res: Response): Promise<void> {
  const q = listQuery.parse(req.query);
  const where: Prisma.ListingWhereInput = {
    status: (q.status as ListingStatus | undefined) ?? ListingStatus.ACTIVE,
    ...(q.featured === true ? { featured: true } : {}),
    ...(q.featured === false ? { featured: false } : {}),
    ...(q.categoryId ? { categoryId: q.categoryId } : {}),
    ...(q.location ? { location: { contains: q.location } } : {}),
    ...(q.minPrice != null || q.maxPrice != null
      ? {
          askingPrice: {
            ...(q.minPrice != null ? { gte: q.minPrice } : {}),
            ...(q.maxPrice != null ? { lte: q.maxPrice } : {}),
          },
        }
      : {}),
    ...(q.q
      ? {
          OR: [{ title: { contains: q.q } }, { description: { contains: q.q } }],
        }
      : {}),
  };

  const [total, listings] = await prisma.$transaction([
    prisma.listing.count({ where }),
    prisma.listing.findMany({
      where,
      include: listingInclude(),
      orderBy: { createdAt: "desc" },
      skip: (q.page - 1) * q.pageSize,
      take: q.pageSize,
    }),
  ]);

  res.json({ listings, total, page: q.page, pageSize: q.pageSize });
}

export async function getListing(req: Request, res: Response): Promise<void> {
  const id = z.string().uuid().parse(req.params.id);
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: listingInclude(),
  });
  if (!listing) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  if (listing.status === ListingStatus.ACTIVE) {
    await prisma.listing.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
  }
  res.json({ listing });
}

export async function postListing(req: Request, res: Response): Promise<void> {
  if (!req.session.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const body = createListingSchema.parse(req.body);

  const category = await prisma.category.findUnique({
    where: { id: body.categoryId },
    include: { attributes: true },
  });
  if (!category) {
    res.status(400).json({ error: "Invalid category" });
    return;
  }

  const attrKeys = new Set(category.attributes.map((a) => a.id));
  for (const key of Object.keys(body.attributes)) {
    if (!attrKeys.has(key)) {
      res.status(400).json({ error: `Unknown attribute: ${key}` });
      return;
    }
  }

  for (const attr of category.attributes) {
    if (attr.required && !body.attributes[attr.id]) {
      res.status(400).json({ error: `Missing required attribute: ${attr.label}` });
      return;
    }
  }

  const listing = await prisma.$transaction(async (tx) => {
    const created = await tx.listing.create({
      data: {
        sellerId: req.session.userId!,
        categoryId: body.categoryId,
        title: body.title,
        description: body.description,
        askingPrice: body.askingPrice,
        currency: body.currency,
        location: body.location,
        status: ListingStatus.ACTIVE,
        images: {
          createMany: {
            data: body.imageUrls.map((url, idx) => ({ url, sortOrder: idx })),
          },
        },
        fees: {
          createMany: {
            data: body.fees.map((f) => ({
              label: f.label,
              amount: f.amount,
              currency: f.currency,
            })),
          },
        },
        terms: {
          createMany: {
            data: body.terms.map((content, idx) => ({
              content,
              sortOrder: idx,
            })),
          },
        },
        attributes: {
          createMany: {
            data: Object.entries(body.attributes).map(([categoryAttributeId, value]) => ({
              categoryAttributeId,
              value,
            })),
          },
        },
      },
      include: listingInclude(),
    });

    await writeAuditLog({
      actorId: req.session.userId,
      action: "listing.create",
      entityType: "listing",
      entityId: created.id,
      ip: req.ip,
    });

    return created;
  });

  res.status(201).json({ listing });
}

export async function patchListing(req: Request, res: Response): Promise<void> {
  if (!req.session.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const id = z.string().uuid().parse(req.params.id);
  const body = updateListingSchema.parse(req.body);

  const existing = await prisma.listing.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  if (existing.sellerId !== req.session.userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const listing = await prisma.$transaction(async (tx) => {
    if (body.imageUrls) {
      await tx.listingImage.deleteMany({ where: { listingId: id } });
    }
    if (body.fees) {
      await tx.listingFee.deleteMany({ where: { listingId: id } });
    }
    if (body.terms) {
      await tx.listingTerm.deleteMany({ where: { listingId: id } });
    }
    if (body.attributes) {
      await tx.listingAttribute.deleteMany({ where: { listingId: id } });
    }

    const updated = await tx.listing.update({
      where: { id },
      data: {
        ...(body.title != null ? { title: body.title } : {}),
        ...(body.description != null ? { description: body.description } : {}),
        ...(body.askingPrice != null ? { askingPrice: body.askingPrice } : {}),
        ...(body.currency != null ? { currency: body.currency } : {}),
        ...(body.location !== undefined ? { location: body.location } : {}),
        ...(body.status != null ? { status: body.status as ListingStatus } : {}),
        ...(body.featured != null ? { featured: body.featured } : {}),
        ...(body.categoryId != null ? { categoryId: body.categoryId } : {}),
        ...(body.imageUrls
          ? {
              images: {
                createMany: {
                  data: body.imageUrls.map((url, idx) => ({ url, sortOrder: idx })),
                },
              },
            }
          : {}),
        ...(body.fees
          ? {
              fees: {
                createMany: {
                  data: body.fees.map((f) => ({
                    label: f.label,
                    amount: f.amount,
                    currency: f.currency,
                  })),
                },
              },
            }
          : {}),
        ...(body.terms
          ? {
              terms: {
                createMany: {
                  data: body.terms.map((content, idx) => ({ content, sortOrder: idx })),
                },
              },
            }
          : {}),
        ...(body.attributes
          ? {
              attributes: {
                createMany: {
                  data: Object.entries(body.attributes).map(([categoryAttributeId, value]) => ({
                    categoryAttributeId,
                    value,
                  })),
                },
              },
            }
          : {}),
      },
      include: listingInclude(),
    });

    await writeAuditLog({
      actorId: req.session.userId,
      action: "listing.update",
      entityType: "listing",
      entityId: id,
      ip: req.ip,
    });

    return updated;
  });

  res.json({ listing });
}

export async function deleteListing(req: Request, res: Response): Promise<void> {
  if (!req.session.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const id = z.string().uuid().parse(req.params.id);

  const existing = await prisma.listing.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  if (existing.sellerId !== req.session.userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  await prisma.listing.update({
    where: { id },
    data: { status: ListingStatus.REMOVED },
  });

  await writeAuditLog({
    actorId: req.session.userId,
    action: "listing.delete",
    entityType: "listing",
    entityId: id,
    ip: req.ip,
  });

  res.json({ ok: true });
}

export async function postListingInterest(req: Request, res: Response): Promise<void> {
  if (!req.session.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const listingId = z.string().uuid().parse(req.params.id);
  const body = interestBody.parse(req.body);

  if (!body.acceptedTerms) {
    res.status(400).json({ error: "Terms must be accepted" });
    return;
  }

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing || listing.status !== ListingStatus.ACTIVE) {
    res.status(404).json({ error: "Listing not available" });
    return;
  }
  if (listing.sellerId === req.session.userId) {
    res.status(400).json({ error: "Cannot express interest in your own listing" });
    return;
  }

  const interest = await prisma.buyerInterest.upsert({
    where: { listingId_buyerId: { listingId, buyerId: req.session.userId } },
    create: {
      listingId,
      buyerId: req.session.userId,
      message: body.message,
      acceptedTerms: true,
      status: InterestStatus.PENDING,
    },
    update: {
      message: body.message,
      acceptedTerms: true,
      status: InterestStatus.PENDING,
    },
    include: {
      buyer: { include: { profile: true } },
      listing: { include: { seller: { include: { profile: true } } } },
    },
  });

  await prisma.notification.create({
    data: {
      userId: listing.sellerId,
      title: "New buyer interest",
      body: `${interest.buyer.profile?.displayName ?? "A buyer"} is interested in “${listing.title}”.`,
    },
  });

  res.status(201).json({ interest });
}
