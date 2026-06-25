import express from "express";
import { getStores } from "../controllers/store.controller.js";
import authenticate from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/", authenticate, authorize("USER"), getStores);

export default router;