import { Router } from "express";
import { asyncHandler } from "../../utils/http.js";
import { requireAuth } from "../../middleware/auth.js";
import * as conversations from "../../controllers/conversations-controller.js";

export const conversationsRouter = Router();

conversationsRouter.use(requireAuth);

conversationsRouter.get("/", asyncHandler(conversations.getConversations));
conversationsRouter.get("/:id/messages", asyncHandler(conversations.getConversationMessages));
conversationsRouter.post("/:id/messages", asyncHandler(conversations.postConversationMessage));
conversationsRouter.post("/start", asyncHandler(conversations.postStartConversation));
