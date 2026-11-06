import { Router } from "express";
import { asyncHandler } from "../../utils/http.js";
import { requireAuth } from "../../middleware/auth.js";
import * as listings from "../../controllers/listings-controller.js";
import * as interests from "../../controllers/interests-controller.js";

export const listingsRouter = Router();

listingsRouter.get("/", asyncHandler(listings.getListings));
listingsRouter.get("/:id", asyncHandler(listings.getListing));

listingsRouter.post("/", requireAuth, asyncHandler(listings.postListing));
listingsRouter.patch("/:id", requireAuth, asyncHandler(listings.patchListing));
listingsRouter.delete("/:id", requireAuth, asyncHandler(listings.deleteListing));

listingsRouter.post("/:id/interests", requireAuth, asyncHandler(listings.postListingInterest));

listingsRouter.patch(
  "/:listingId/interests/:interestId",
  requireAuth,
  asyncHandler(interests.patchSellerInterest)
);
