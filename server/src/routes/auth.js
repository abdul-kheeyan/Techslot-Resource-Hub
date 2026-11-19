import { Router } from "express";
import { login, me, register } from "../controllers/auth.js";
import { requireUser } from "../middleware/auth.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.get("/me", requireUser, asyncHandler(me));

export default router;
