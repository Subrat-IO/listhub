import type { NextFunction, Request, Response } from "express";

const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  if (!MUTATING.has(req.method)) {
    next();
    return;
  }

  // Auth endpoints establish session; allow without prior CSRF if session has no user yet
  const path = req.path;
  if (
    path.endsWith("/auth/register") ||
    path.endsWith("/auth/login") ||
    path.endsWith("/auth/csrf")
  ) {
    next();
    return;
  }

  const token = req.get("x-csrf-token");
  const sessionToken = req.session.csrfToken;
  if (!sessionToken || !token || token !== sessionToken) {
    res.status(403).json({ error: "Invalid or missing CSRF token" });
    return;
  }

  next();
}
