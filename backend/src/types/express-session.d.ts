import type { RoleName } from "@prisma/client";

declare module "express-session" {
  interface SessionData {
    userId?: string;
    roles?: RoleName[];
    csrfToken?: string;
  }
}
