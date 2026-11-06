import session from "express-session";
import type { SessionData } from "express-session";
import { prisma } from "../lib/prisma.js";

export class PrismaSessionStore extends session.Store {
  get(sid: string, callback: (err: unknown, sess?: SessionData | null) => void): void {
    void (async () => {
      try {
        const row = await prisma.session.findUnique({ where: { sid } });
        if (!row || row.expires < new Date()) {
          callback(null, null);
          return;
        }
        const sess = JSON.parse(row.data) as SessionData;
        callback(null, sess);
      } catch (err) {
        callback(err);
      }
    })();
  }

  set(sid: string, sess: SessionData, callback?: (err?: unknown) => void): void {
    void (async () => {
      try {
        const expires =
          sess.cookie?.expires != null
            ? new Date(sess.cookie.expires)
            : new Date(Date.now() + 24 * 60 * 60 * 1000);
        const data = JSON.stringify(sess);
        const userId = typeof sess.userId === "string" ? sess.userId : null;
        await prisma.session.upsert({
          where: { sid },
          create: { sid, expires, data, userId },
          update: { expires, data, userId },
        });
        callback?.();
      } catch (err) {
        callback?.(err);
      }
    })();
  }

  destroy(sid: string, callback?: (err?: unknown) => void): void {
    void (async () => {
      try {
        await prisma.session.deleteMany({ where: { sid } });
        callback?.();
      } catch (err) {
        callback?.(err);
      }
    })();
  }

  touch(sid: string, sess: SessionData, callback?: () => void): void {
    void (async () => {
      try {
        const expires =
          sess.cookie?.expires != null
            ? new Date(sess.cookie.expires)
            : new Date(Date.now() + 24 * 60 * 60 * 1000);
        await prisma.session.updateMany({
          where: { sid },
          data: { expires, data: JSON.stringify(sess) },
        });
        callback?.();
      } catch {
        callback?.();
      }
    })();
  }
}
