import type { Request, Response } from "express";
import { InterestStatus, ListingStatus, Prisma, ReportStatus, UserStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { writeAuditLog } from "../utils/audit.js";

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

export async function getDashboard(_req: Request, res: Response): Promise<void> {
  const now = new Date();
  const day = 24 * 60 * 60 * 1000;
  const since7d = new Date(now.getTime() - 7 * day);

  const [users, listings, reportsOpen, interestsPending, auditRecent] = await prisma.$transaction([
    prisma.user.count(),
    prisma.listing.count({ where: { status: ListingStatus.ACTIVE } }),
    prisma.report.count({ where: { status: ReportStatus.OPEN } }),
    prisma.buyerInterest.count({ where: { status: InterestStatus.PENDING } }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { actor: { include: { profile: true } } },
    }),
  ]);

  const [newUsers7d, newListings7d] = await prisma.$transaction([
    prisma.user.count({ where: { createdAt: { gte: since7d } } }),
    prisma.listing.count({ where: { createdAt: { gte: since7d } } }),
  ]);

  res.json({
    totals: {
      users,
      activeListings: listings,
      openReports: reportsOpen,
      pendingInterests: interestsPending,
    },
    last7Days: {
      newUsers: newUsers7d,
      newListings: newListings7d,
    },
    recentAudit: auditRecent,
  });
}

const pageQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  q: z.string().optional(),
});

export async function getAdminUsers(req: Request, res: Response): Promise<void> {
  const q = pageQuery.parse(req.query);
  const where: Prisma.UserWhereInput = q.q
    ? {
        OR: [
          { email: { contains: q.q } },
          { profile: { displayName: { contains: q.q } } },
        ],
      }
    : {};

  const [total, users] = await prisma.$transaction([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      include: { profile: true, userRoles: { include: { role: true } } },
      orderBy: { createdAt: "desc" },
      skip: (q.page - 1) * q.pageSize,
      take: q.pageSize,
    }),
  ]);

  res.json({ users, total, page: q.page, pageSize: q.pageSize });
}

export async function getAdminListings(req: Request, res: Response): Promise<void> {
  const q = pageQuery.extend({ status: z.nativeEnum(ListingStatus).optional() }).parse(req.query);
  const where: Prisma.ListingWhereInput = {
    ...(q.status ? { status: q.status } : {}),
    ...(q.q
      ? {
          OR: [
            { title: { contains: q.q } },
            { description: { contains: q.q } },
            { location: { contains: q.q } },
          ],
        }
      : {}),
  };

  const [total, listings] = await prisma.$transaction([
    prisma.listing.count({ where }),
    prisma.listing.findMany({
      where,
      include: listingInclude(),
      orderBy: { updatedAt: "desc" },
      skip: (q.page - 1) * q.pageSize,
      take: q.pageSize,
    }),
  ]);

  res.json({ listings, total, page: q.page, pageSize: q.pageSize });
}

export async function getAdminCategories(_req: Request, res: Response): Promise<void> {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { attributes: { orderBy: { sortOrder: "asc" } } },
  });
  res.json({ categories });
}

export async function getAdminReports(req: Request, res: Response): Promise<void> {
  const q = pageQuery.extend({ status: z.nativeEnum(ReportStatus).optional() }).parse(req.query);
  const where: Prisma.ReportWhereInput = {
    ...(q.status ? { status: q.status } : {}),
  };

  const [total, reports] = await prisma.$transaction([
    prisma.report.count({ where }),
    prisma.report.findMany({
      where,
      include: {
        reporter: { include: { profile: true } },
        listing: { include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } } },
      },
      orderBy: { createdAt: "desc" },
      skip: (q.page - 1) * q.pageSize,
      take: q.pageSize,
    }),
  ]);

  res.json({ reports, total, page: q.page, pageSize: q.pageSize });
}

const statusPatchSchema = z.object({
  status: z.nativeEnum(UserStatus),
});

export async function patchAdminUserStatus(req: Request, res: Response): Promise<void> {
  const id = z.string().uuid().parse(req.params.id);
  const body = statusPatchSchema.parse(req.body);

  const user = await prisma.user.update({
    where: { id },
    data: { status: body.status },
    include: { profile: true, userRoles: { include: { role: true } } },
  });

  await writeAuditLog({
    actorId: req.session.userId,
    action: "admin.user.status",
    entityType: "user",
    entityId: id,
    metadata: { status: body.status },
    ip: req.ip,
  });

  res.json({ user });
}

const listingStatusPatchSchema = z.object({
  status: z.nativeEnum(ListingStatus).optional(),
  featured: z.boolean().optional(),
});

export async function patchAdminListingStatus(req: Request, res: Response): Promise<void> {
  const id = z.string().uuid().parse(req.params.id);
  const body = listingStatusPatchSchema.parse(req.body);

  if (body.status === undefined && body.featured === undefined) {
    res.status(400).json({ error: "Nothing to update" });
    return;
  }

  const listing = await prisma.listing.update({
    where: { id },
    data: {
      ...(body.status != null ? { status: body.status } : {}),
      ...(body.featured != null ? { featured: body.featured } : {}),
    },
    include: listingInclude(),
  });

  await writeAuditLog({
    actorId: req.session.userId,
    action: "admin.listing.update",
    entityType: "listing",
    entityId: id,
    metadata: { status: body.status, featured: body.featured },
    ip: req.ip,
  });

  res.json({ listing });
}

export async function getAdminAuditLogs(req: Request, res: Response): Promise<void> {
  const q = pageQuery.parse(req.query);
  const [total, logs] = await prisma.$transaction([
    prisma.auditLog.count(),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      skip: (q.page - 1) * q.pageSize,
      take: q.pageSize,
      include: { actor: { include: { profile: true } } },
    }),
  ]);

  res.json({ logs, total, page: q.page, pageSize: q.pageSize });
}

export async function getAdminAnalytics(req: Request, res: Response): Promise<void> {
  const q = z
    .object({
      days: z.coerce.number().int().min(1).max(90).default(14),
    })
    .parse(req.query);

  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;
  const days: { day: string; newListings: number; newUsers: number; messages: number }[] = [];

  for (let i = q.days - 1; i >= 0; i -= 1) {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    start.setTime(start.getTime() - i * dayMs);
    const end = new Date(start.getTime() + dayMs);

    const [newListings, newUsers, messages] = await prisma.$transaction([
      prisma.listing.count({ where: { createdAt: { gte: start, lt: end } } }),
      prisma.user.count({ where: { createdAt: { gte: start, lt: end } } }),
      prisma.message.count({ where: { createdAt: { gte: start, lt: end } } }),
    ]);

    days.push({
      day: start.toISOString().slice(0, 10),
      newListings,
      newUsers,
      messages,
    });
  }

  res.json({ series: days });
}

const moderateSchema = z.object({
  action: z.string().min(1).max(120),
  targetType: z.string().min(1).max(120),
  targetId: z.string().uuid(),
  note: z.string().max(2000).optional(),
  reportStatus: z.nativeEnum(ReportStatus).optional(),
});

export async function postAdminModeration(req: Request, res: Response): Promise<void> {
  const body = moderateSchema.parse(req.body);

  const mod = await prisma.$transaction(async (tx) => {
    const created = await tx.moderationAction.create({
      data: {
        moderatorId: req.session.userId!,
        targetType: body.targetType,
        targetId: body.targetId,
        action: body.action,
        note: body.note,
      },
    });

    if (body.reportStatus && body.targetType.toLowerCase() === "report") {
      await tx.report.update({
        where: { id: body.targetId },
        data: { status: body.reportStatus },
      });
    }

    return created;
  });

  await writeAuditLog({
    actorId: req.session.userId,
    action: "admin.moderation",
    entityType: "moderation",
    entityId: mod.id,
    metadata: { ...body },
    ip: req.ip,
  });

  res.status(201).json({ moderation: mod });
}
