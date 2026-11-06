import { Router } from "express";
import { asyncHandler } from "../../utils/http.js";
import * as categories from "../../controllers/categories-controller.js";

export const categoriesRouter = Router();

categoriesRouter.get("/", asyncHandler(categories.getCategories));
