import { Router } from "express";
import { asyncHandler } from "../../utils/http.js";
import { requireAuth, requireRoles } from "../../middleware/auth.js";
import * as admin from "../../controllers/admin-controller.js";
import * as categories from "../../controllers/categories-controller.js";
import * as reports from "../../controllers/reports-controller.js";

export const adminRouter = Router();

adminRouter.use(requireAuth);
adminRouter.use(requireRoles("MODERATOR", "ADMIN", "SUPER_ADMIN"));

adminRouter.get("/dashboard", asyncHandler(admin.getDashboard));
adminRouter.get("/users", asyncHandler(admin.getAdminUsers));
adminRouter.get("/listings", asyncHandler(admin.getAdminListings));
adminRouter.get("/categories", asyncHandler(admin.getAdminCategories));
adminRouter.get("/reports", asyncHandler(admin.getAdminReports));

adminRouter.patch("/users/:id/status", asyncHandler(admin.patchAdminUserStatus));
adminRouter.patch("/listings/:id/status", asyncHandler(admin.patchAdminListingStatus));

adminRouter.post("/categories", requireRoles("ADMIN", "SUPER_ADMIN"), asyncHandler(categories.postAdminCategory));
adminRouter.patch(
  "/categories/:id",
  requireRoles("ADMIN", "SUPER_ADMIN"),
  asyncHandler(categories.patchAdminCategory)
);
adminRouter.delete(
  "/categories/:id",
  requireRoles("ADMIN", "SUPER_ADMIN"),
  asyncHandler(categories.deleteAdminCategory)
);

adminRouter.get("/audit-logs", asyncHandler(admin.getAdminAuditLogs));
adminRouter.get("/analytics", asyncHandler(admin.getAdminAnalytics));
adminRouter.post(
  "/moderation",
  requireRoles("MODERATOR", "ADMIN", "SUPER_ADMIN"),
  asyncHandler(admin.postAdminModeration)
);

adminRouter.patch(
  "/reports/:id/status",
  requireRoles("MODERATOR", "ADMIN", "SUPER_ADMIN"),
  asyncHandler(reports.patchAdminReportStatus)
);
