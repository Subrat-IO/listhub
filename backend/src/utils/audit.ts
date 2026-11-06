import { prisma } from "../lib/prisma.js";

export async function writeAuditLog(input: {
  actorId?: string | null;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
  ip?: string | null;
}) {
  await prisma.auditLog.create({
    data: {
      actorId: input.actorId ?? undefined,
      action: input.action,
      entityType: input.entityType ?? undefined,
      entityId: input.entityId ?? undefined,
      metadata: input.metadata ? JSON.stringify(input.metadata) : undefined,
      ip: input.ip ?? undefined,
    },
  });
}
