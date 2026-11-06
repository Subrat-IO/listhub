import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";

export async function getNotifications(req: Request, res: Response): Promise<void> {
  if (!req.session.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const items = await prisma.notification.findMany({
    where: { userId: req.session.userId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  res.json({ notifications: items });
}

export async function patchNotificationRead(req: Request, res: Response): Promise<void> {
  if (!req.session.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const id = z.string().uuid().parse(req.params.id);
  const read = z.object({ read: z.boolean() }).parse(req.body).read;

  const note = await prisma.notification.updateMany({
    where: { id, userId: req.session.userId },
    data: { read },
  });

  if (note.count === 0) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.json({ ok: true });
}
