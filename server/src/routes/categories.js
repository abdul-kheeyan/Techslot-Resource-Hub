import { Router } from "express";
import { createCategory, deleteCategory, listCategories, updateCategory } from "../controllers/categories.js";
import { requireAdmin } from "../middleware/auth.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(listCategories));
router.post("/", requireAdmin, asyncHandler(createCategory));
router.put("/:id", requireAdmin, asyncHandler(updateCategory));
router.delete("/:id", requireAdmin, asyncHandler(deleteCategory));

export default router;
