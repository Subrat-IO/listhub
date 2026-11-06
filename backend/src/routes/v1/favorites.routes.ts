import { Router } from "express";
import { asyncHandler } from "../../utils/http.js";
import { requireAuth } from "../../middleware/auth.js";
import * as favorites from "../../controllers/favorites-controller.js";

export const favoritesRouter = Router();

favoritesRouter.use(requireAuth);

favoritesRouter.post("/", asyncHandler(favorites.postFavorite));
favoritesRouter.delete("/:listingId", asyncHandler(favorites.deleteFavorite));
