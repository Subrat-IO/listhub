import type { Request, Response } from "express";
import { InterestStatus, ListingStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { writeAuditLog } from "../utils/audit.js";

const patchSchema = z.object({
  status: z.enum(["ACCEPTED", "DECLINED"]),
});

export async function patchSellerInterest(req: Request, res: Response): Promise<void> {
  if (!req.session.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const listingId = z.string().uuid().parse(req.params.listingId);
  const interestId = z.string().uuid().parse(req.params.interestId);
  const body = patchSchema.parse(req.body);

  const interest = await prisma.buyerInterest.findUnique({
    where: { id: interestId },
    include: {
      listing: true,
      agreement: true,
    },
  });

  if (!interest || interest.listingId !== listingId) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  if (interest.listing.sellerId !== req.session.userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  if (interest.status !== InterestStatus.PENDING) {
    res.status(400).json({ error: "Interest is not pending" });
    return;
  }

  const updated = await prisma.$transaction(async (tx) => {
    const nextStatus = body.status === "ACCEPTED" ? InterestStatus.ACCEPTED : InterestStatus.DECLINED;

    const u = await tx.buyerInterest.update({
      where: { id: interestId },
      data: { status: nextStatus },
      include: {
        buyer: { include: { profile: true } },
        listing: { include: { seller: { include: { profile: true } } } },
      },
    });

    if (body.status === "ACCEPTED") {
      await tx.interestAgreement.upsert({
        where: { interestId },
        create: {
          interestId,
          snapshot: JSON.stringify({
            listingId,
            acceptedAt: new Date().toISOString(),
          }),
        },
        update: {
          snapshot: JSON.stringify({
            listingId,
            acceptedAt: new Date().toISOString(),
          }),
        },
      });

      await tx.listing.update({
        where: { id: listingId },
        data: { status: ListingStatus.SOLD },
      });

      await tx.buyerInterest.updateMany({
        where: {
          listingId,
          id: { not: interestId },
          status: InterestStatus.PENDING,
        },
        data: { status: InterestStatus.DECLINED },
      });
    }

    return u;
  });

  await prisma.notification.create({
    data: {
      userId: updated.buyerId,
      title: body.status === "ACCEPTED" ? "Your interest was accepted" : "Update on your interest",
      body:
        body.status === "ACCEPTED"
          ? `The seller accepted your interest for “${updated.listing.title}”.`
          : `The seller declined your interest for “${updated.listing.title}”.`,
    },
  });

  await writeAuditLog({
    actorId: req.session.userId,
    action: "interest.status",
    entityType: "buyer_interest",
    entityId: interestId,
    metadata: { status: body.status },
    ip: req.ip,
  });

  res.json({ interest: updated });
}
