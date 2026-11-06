import type { Request, Response } from "express";
import { ConversationKind } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";

export async function getConversations(req: Request, res: Response): Promise<void> {
  if (!req.session.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const convos = await prisma.conversation.findMany({
    where: {
      participants: { some: { userId: req.session.userId } },
    },
    include: {
      listing: {
        include: {
          seller: { include: { profile: true } },
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
        },
      },
      participants: { include: { user: { include: { profile: true } } } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });

  res.json({ conversations: convos });
}

const postMessageSchema = z.object({
  body: z.string().min(1).max(8000),
});

export async function getConversationMessages(req: Request, res: Response): Promise<void> {
  if (!req.session.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const conversationId = z.string().uuid().parse(req.params.id);

  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: { conversationId, userId: req.session.userId },
    },
  });
  if (!participant) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    include: { sender: { include: { profile: true } } },
  });

  res.json({ messages });
}

export async function postConversationMessage(req: Request, res: Response): Promise<void> {
  if (!req.session.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const conversationId = z.string().uuid().parse(req.params.id);
  const body = postMessageSchema.parse(req.body);

  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: { conversationId, userId: req.session.userId },
    },
  });
  if (!participant) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const message = await prisma.$transaction(async (tx) => {
    const created = await tx.message.create({
      data: {
        conversationId,
        senderId: req.session.userId!,
        body: body.body,
      },
      include: { sender: { include: { profile: true } } },
    });

    await tx.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    const convo = await tx.conversation.findUnique({
      where: { id: conversationId },
      include: { participants: true, listing: true },
    });

    const recipients =
      convo?.participants
        .map((p) => p.userId)
        .filter((uid) => uid !== req.session.userId) ?? [];

    await Promise.all(
      recipients.map((userId) =>
        tx.notification.create({
          data: {
            userId,
            title: "New message",
            body: body.body.length > 160 ? `${body.body.slice(0, 157)}…` : body.body,
          },
        })
      )
    );

    return created;
  });

  const io = req.app.get("io");
  io?.to(`conversation:${conversationId}`).emit("message:new", {
    conversationId,
    message,
  });

  res.status(201).json({ message });
}

const startSchema = z.object({
  listingId: z.string().uuid().optional(),
  recipientUserId: z.string().uuid().optional(),
  initialMessage: z.string().min(1).max(8000).optional(),
});

/** Not part of the listed endpoints, but enables UX for messaging from listing pages. */
export async function postStartConversation(req: Request, res: Response): Promise<void> {
  if (!req.session.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const body = startSchema.parse(req.body);

  if (!body.listingId && !body.recipientUserId) {
    res.status(400).json({ error: "listingId or recipientUserId required" });
    return;
  }

  const listingId: string | undefined = body.listingId;
  let recipientUserId: string | undefined = body.recipientUserId;

  if (listingId) {
    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) {
      res.status(404).json({ error: "Listing not found" });
      return;
    }
    recipientUserId = listing.sellerId;
  }

  if (!recipientUserId || recipientUserId === req.session.userId) {
    res.status(400).json({ error: "Invalid recipient" });
    return;
  }

  const participants = [req.session.userId, recipientUserId];

  const existing = await prisma.conversation.findFirst({
    where: {
      listingId: listingId ?? null,
      AND: [
        { participants: { some: { userId: participants[0] } } },
        { participants: { some: { userId: participants[1]! } } },
      ],
    },
    include: { participants: true },
  });

  if (existing && existing.participants.length === 2) {
    res.json({ conversationId: existing.id });
    return;
  }

  const convo = await prisma.$transaction(async (tx) => {
    const created = await tx.conversation.create({
      data: {
        listingId,
        kind: listingId ? ConversationKind.LISTING_INQUIRY : ConversationKind.GENERAL,
        participants: {
          createMany: {
            data: participants.map((userId) => ({ userId })),
          },
        },
      },
    });

    if (body.initialMessage) {
      await tx.message.create({
        data: {
          conversationId: created.id,
          senderId: req.session.userId!,
          body: body.initialMessage,
        },
      });
    }

    return created;
  });

  res.status(201).json({ conversationId: convo.id });
}
