import { Router } from "express";
import { authRouter } from "./auth.routes.js";
import { categoriesRouter } from "./categories.routes.js";
import { listingsRouter } from "./listings.routes.js";
import { meRouter } from "./me.routes.js";
import { favoritesRouter } from "./favorites.routes.js";
import { conversationsRouter } from "./conversations.routes.js";
import { reportsRouter } from "./reports.routes.js";
import { adminRouter } from "./admin.routes.js";

export function createAppRouter(): Router {
  const r = Router();

  r.use("/auth", authRouter);
  r.use("/categories", categoriesRouter);
  r.use("/listings", listingsRouter);
  r.use("/me", meRouter);
  r.use("/favorites", favoritesRouter);
  r.use("/conversations", conversationsRouter);
  r.use("/reports", reportsRouter);
  r.use("/admin", adminRouter);

  return r;
}
