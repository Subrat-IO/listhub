import { Router } from "express";
import { asyncHandler } from "../../utils/http.js";
import { requireAuth } from "../../middleware/auth.js";
import * as reports from "../../controllers/reports-controller.js";

export const reportsRouter = Router();

reportsRouter.use(requireAuth);
reportsRouter.post("/", asyncHandler(reports.postReport));
