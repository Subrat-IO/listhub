import { Router } from "express";
import { asyncHandler } from "../../utils/http.js";
import { requireAuth } from "../../middleware/auth.js";
import * as me from "../../controllers/me-controller.js";
import * as notifications from "../../controllers/notifications-controller.js";

export const meRouter = Router();

meRouter.use(requireAuth);

meRouter.get("/listings", asyncHandler(me.getMeListings));
meRouter.get("/favorites", asyncHandler(me.getMeFavorites));
meRouter.get("/interests", asyncHandler(me.getMeInterests));
meRouter.get("/received-interests", asyncHandler(me.getMeReceivedInterests));

meRouter.patch("/profile", asyncHandler(me.patchMeProfile));

meRouter.get("/notifications", asyncHandler(notifications.getNotifications));
meRouter.patch("/notifications/:id", asyncHandler(notifications.patchNotificationRead));
