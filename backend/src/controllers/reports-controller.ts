import type { Request, Response } from "express";
import { ReportStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { writeAuditLog } from "../utils/audit.js";

const bodySchema = z.object({
  listingId: z.string().uuid().optional(),
  reason: z.string().min(10).max(4000),
});

export async function postReport(req: Request, res: Response): Promise<void> {
  if (!req.session.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const body = bodySchema.parse(req.body);

  if (body.listingId) {
    const listing = await prisma.listing.findUnique({ where: { id: body.listingId } });
    if (!listing) {
      res.status(404).json({ error: "Listing not found" });
      return;
    }
  }

  const report = await prisma.report.create({
    data: {
      reporterId: req.session.userId,
      listingId: body.listingId,
      reason: body.reason,
    },
  });

  res.status(201).json({ report });
}

const patchSchema = z.object({
  status: z.nativeEnum(ReportStatus),
});

export async function patchAdminReportStatus(req: Request, res: Response): Promise<void> {
  const id = z.string().uuid().parse(req.params.id);
  const body = patchSchema.parse(req.body);

  const report = await prisma.report.update({
    where: { id },
    data: { status: body.status },
    include: {
      reporter: { include: { profile: true } },
      listing: { include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } } },
    },
  });

  await writeAuditLog({
    actorId: req.session.userId,
    action: "admin.report.status",
    entityType: "report",
    entityId: id,
    metadata: { status: body.status },
    ip: req.ip,
  });

  res.json({ report });
}
