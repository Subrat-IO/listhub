import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";

const bodySchema = z.object({
  listingId: z.string().uuid(),
});

export async function postFavorite(req: Request, res: Response): Promise<void> {
  if (!req.session.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { listingId } = bodySchema.parse(req.body);

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  await prisma.favorite.upsert({
    where: { userId_listingId: { userId: req.session.userId, listingId } },
    create: { userId: req.session.userId, listingId },
    update: {},
  });

  res.status(201).json({ ok: true });
}

export async function deleteFavorite(req: Request, res: Response): Promise<void> {
  if (!req.session.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const listingId = z.string().uuid().parse(req.params.listingId);

  await prisma.favorite.deleteMany({
    where: { userId: req.session.userId, listingId },
  });

  res.json({ ok: true });
}
