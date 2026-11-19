import { Router } from "express";
import { dashboard, getSettings, login, updateSettings } from "../controllers/admin.js";
import { requireAdmin } from "../middleware/auth.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

router.post("/login", asyncHandler(login));
router.get("/dashboard", requireAdmin, asyncHandler(dashboard));
router.get("/settings", requireAdmin, asyncHandler(getSettings));
router.put("/settings", requireAdmin, asyncHandler(updateSettings));

export default router;
