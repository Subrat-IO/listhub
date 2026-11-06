import type { Request, Response } from "express";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

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

export async function getMeListings(req: Request, res: Response): Promise<void> {
  if (!req.session.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const listings = await prisma.listing.findMany({
    where: { sellerId: req.session.userId },
    include: listingInclude(),
    orderBy: { updatedAt: "desc" },
  });
  res.json({ listings });
}

export async function getMeFavorites(req: Request, res: Response): Promise<void> {
  if (!req.session.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const favs = await prisma.favorite.findMany({
    where: { userId: req.session.userId },
    include: { listing: { include: listingInclude() } },
    orderBy: { createdAt: "desc" },
  });
  res.json({ favorites: favs.map((f) => f.listing) });
}

export async function getMeInterests(req: Request, res: Response): Promise<void> {
  if (!req.session.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const interests = await prisma.buyerInterest.findMany({
    where: { buyerId: req.session.userId },
    include: {
      listing: { include: listingInclude() },
      agreement: true,
    },
    orderBy: { createdAt: "desc" },
  });
  res.json({ interests });
}

export async function getMeReceivedInterests(req: Request, res: Response): Promise<void> {
  if (!req.session.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const interests = await prisma.buyerInterest.findMany({
    where: { listing: { sellerId: req.session.userId } },
    include: {
      buyer: { include: { profile: true } },
      listing: { include: listingInclude() },
      agreement: true,
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({ interests });
}

const patchProfileSchema = z.object({
  displayName: z.string().min(2).max(80).optional(),
  bio: z.string().max(2000).optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  phone: z.string().max(40).optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
});

export async function patchMeProfile(req: Request, res: Response): Promise<void> {
  if (!req.session.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const body = patchProfileSchema.parse(req.body);

  const profile = await prisma.profile.upsert({
    where: { userId: req.session.userId },
    create: {
      userId: req.session.userId,
      displayName: body.displayName ?? "ListHub User",
      bio: body.bio ?? undefined,
      location: body.location ?? undefined,
      phone: body.phone ?? undefined,
      avatarUrl: body.avatarUrl ?? undefined,
    },
    update: {
      ...(body.displayName != null ? { displayName: body.displayName } : {}),
      ...(body.bio !== undefined ? { bio: body.bio ?? undefined } : {}),
      ...(body.location !== undefined ? { location: body.location ?? undefined } : {}),
      ...(body.phone !== undefined ? { phone: body.phone ?? undefined } : {}),
      ...(body.avatarUrl !== undefined ? { avatarUrl: body.avatarUrl ?? undefined } : {}),
    },
  });

  res.json({ profile });
}
