import type { Request, Response } from "express";
import { z } from "zod";
import * as authService from "../services/auth-service.js";
import * as userRepo from "../repositories/user-repository.js";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(2).max(80),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function postRegister(req: Request, res: Response): Promise<void> {
  const body = registerSchema.parse(req.body);
  const user = await authService.registerUser(body);
  const roles = userRepo.mapRoles(user);
  authService.attachSession(req, user.id, roles);
  res.status(201).json({
    user: {
      id: user.id,
      email: user.email,
      displayName: user.profile?.displayName,
      roles,
    },
    csrfToken: req.session.csrfToken,
  });
}

export async function postLogin(req: Request, res: Response): Promise<void> {
  const body = loginSchema.parse(req.body);
  const user = await authService.loginUser(body);
  const roles = userRepo.mapRoles(user);
  authService.attachSession(req, user.id, roles);
  res.json({
    user: {
      id: user.id,
      email: user.email,
      displayName: user.profile?.displayName,
      roles,
    },
    csrfToken: req.session.csrfToken,
  });
}

export async function postLogout(req: Request, res: Response): Promise<void> {
  const cookieName = req.app.get("sessionCookieName") as string;
  await authService.destroySession(req);
  res.clearCookie(cookieName, {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.SESSION_COOKIE_SECURE === "true",
    path: "/",
  });
  res.json({ ok: true });
}

export async function getMe(req: Request, res: Response): Promise<void> {
  if (!req.session.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const user = await userRepo.findUserWithRolesById(req.session.userId);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  res.json({
    user: {
      id: user.id,
      email: user.email,
      status: user.status,
      displayName: user.profile?.displayName,
      bio: user.profile?.bio,
      location: user.profile?.location,
      roles: userRepo.mapRoles(user),
    },
  });
}

export async function getCsrf(req: Request, res: Response): Promise<void> {
  if (!req.session.csrfToken) {
    req.session.csrfToken = (await import("../utils/csrf.js")).generateCsrfToken();
  }
  res.json({ csrfToken: req.session.csrfToken });
}
