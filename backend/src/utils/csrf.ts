import crypto from "node:crypto";

export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString("hex");
}
