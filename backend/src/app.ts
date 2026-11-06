import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import session from "express-session";
import helmet from "helmet";
import { createAppRouter } from "./routes/v1/index.js";
import { env } from "./config/env.js";
import { PrismaSessionStore } from "./utils/session-store.js";
import { csrfProtection } from "./middleware/csrf.js";
import { errorHandler } from "./middleware/error-handler.js";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);
  app.set("sessionCookieName", env.SESSION_COOKIE_NAME);

  const allowedOrigins = new Set([env.WEBSITE_URL.replace(/\/$/, ""), env.ADMIN_URL.replace(/\/$/, "")]);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );
  app.use(cookieParser());
  app.use(
    cors({
      origin(origin, cb) {
        if (!origin || allowedOrigins.has(origin)) {
          cb(null, true);
          return;
        }
        cb(null, false);
      },
      credentials: true,
    })
  );
  app.use(express.json({ limit: "1mb" }));

  const store = new PrismaSessionStore();

  const sessionMiddleware = session({
    name: env.SESSION_COOKIE_NAME,
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store,
    cookie: {
      httpOnly: true,
      secure: env.SESSION_COOKIE_SECURE,
      sameSite: env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  });

  app.use(sessionMiddleware);

  app.use(csrfProtection);
  app.use("/api/v1", createAppRouter());
  app.get("/healthz", (_req, res) => {
    res.json({ ok: true });
  });

  app.use(errorHandler);

  return { app, sessionMiddleware };
}
