import type { RoleName } from "@prisma/client";
import type { Request } from "express";
import * as userRepo from "../repositories/user-repository.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { generateCsrfToken } from "../utils/csrf.js";

export async function registerUser(input: {
  email: string;
  password: string;
  displayName: string;
}) {
  const existing = await userRepo.findUserWithRolesByEmail(input.email);
  if (existing) {
    const err = new Error("Email already registered");
    (err as { status?: number }).status = 409;
    throw err;
  }
  const passwordHash = await hashPassword(input.password);
  const user = await userRepo.createUser({
    email: input.email,
    passwordHash,
    displayName: input.displayName,
    roleNames: ["USER"],
  });
  return user;
}

export async function loginUser(input: { email: string; password: string }) {
  const user = await userRepo.findUserWithRolesByEmail(input.email);
  if (!user) {
    const err = new Error("Invalid credentials");
    (err as { status?: number }).status = 401;
    throw err;
  }
  const ok = await verifyPassword(input.password, user.passwordHash);
  if (!ok) {
    const err = new Error("Invalid credentials");
    (err as { status?: number }).status = 401;
    throw err;
  }
  if (user.status !== "ACTIVE") {
    const err = new Error("Account is not active");
    (err as { status?: number }).status = 403;
    throw err;
  }
  return user;
}

export function attachSession(req: Request, userId: string, roles: RoleName[]) {
  req.session.userId = userId;
  req.session.roles = roles;
  req.session.csrfToken = req.session.csrfToken ?? generateCsrfToken();
}

export function destroySession(req: Request) {
  return new Promise<void>((resolve, reject) => {
    req.session.destroy((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}
