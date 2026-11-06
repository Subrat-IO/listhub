import "./config/load-env.js";

import { createServer } from "node:http";
import cookie from "cookie";
import { unsign } from "cookie-signature";
import session from "express-session";
import { Server as SocketIOServer } from "socket.io";

import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";

const { app, sessionMiddleware } = createApp();
const httpServer = createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: [env.WEBSITE_URL.replace(/\/$/, ""), env.ADMIN_URL.replace(/\/$/, "")],
    credentials: true,
  },
});

io.engine.use(sessionMiddleware);

io.use(async (socket, next) => {
  try {
    const cookieHeader = socket.request.headers.cookie;
    if (!cookieHeader) {
      next(new Error("Unauthorized"));
      return;
    }
    const parsed = cookie.parse(cookieHeader);
    const signed = parsed[env.SESSION_COOKIE_NAME];
    if (!signed || typeof signed !== "string") {
      next(new Error("Unauthorized"));
      return;
    }

    const raw = signed.startsWith("s:") ? unsign(signed.slice(2), env.SESSION_SECRET) : signed;
    if (!raw || typeof raw !== "string") {
      next(new Error("Unauthorized"));
      return;
    }

    const row = await prisma.session.findUnique({ where: { sid: raw } });
    if (!row || row.expires < new Date()) {
      next(new Error("Unauthorized"));
      return;
    }

    const sess = JSON.parse(row.data) as session.SessionData & { userId?: string };
    if (!sess.userId) {
      next(new Error("Unauthorized"));
      return;
    }

    (socket.data as { userId: string }).userId = sess.userId;
    next();
  } catch {
    next(new Error("Unauthorized"));
  }
});

io.on("connection", (socket) => {
  const userId = (socket.data as { userId?: string }).userId;
  if (!userId) {
    socket.disconnect(true);
    return;
  }
  void socket.join(`user:${userId}`);
  socket.on("join_conversation", (conversationId: string) => {
    if (typeof conversationId === "string" && conversationId.length > 0) {
      void socket.join(`conversation:${conversationId}`);
    }
  });
});

app.set("io", io);

httpServer.listen(env.PORT, () => {
  console.log(`ListHub API listening on :${env.PORT}`);
});
