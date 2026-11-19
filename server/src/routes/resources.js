import { Router } from "express";
import {
  createResource,
  deleteResource,
  downloadResource,
  featuredResources,
  getResource,
  getResourceThumbnail,
  latestResources,
  listManagedResources,
  listResources,
  popularResources,
  updateResource,
} from "../controllers/resources.js";
import { optionalAuth, requireAdmin } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();
const resourceUploads = upload.fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "file", maxCount: 1 },
]);

router.get("/latest", asyncHandler(latestResources));
router.get("/featured", asyncHandler(featuredResources));
router.get("/popular", asyncHandler(popularResources));
router.get("/manage", requireAdmin, asyncHandler(listManagedResources));
router.get("/", asyncHandler(listResources));
router.post("/", requireAdmin, resourceUploads, asyncHandler(createResource));
router.get("/:id/thumbnail", asyncHandler(getResourceThumbnail));
router.get("/:id/download", optionalAuth, asyncHandler(downloadResource));
router.get("/:slug", asyncHandler(getResource));
router.put("/:id", requireAdmin, resourceUploads, asyncHandler(updateResource));
router.delete("/:id", requireAdmin, asyncHandler(deleteResource));

export default router;
