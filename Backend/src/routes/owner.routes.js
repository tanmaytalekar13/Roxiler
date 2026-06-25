import express from "express";
import { getOwnerDashboard } from "../controllers/owner.controller.js";
import authenticate from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/dashboard", authenticate, authorize("OWNER"), getOwnerDashboard);

export default router;