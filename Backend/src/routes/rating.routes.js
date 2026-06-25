import express from "express";
import { submitRating, updateRating } from "../controllers/rating.controller.js";
import authenticate from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";

const router = express.Router();

router.use(authenticate, authorize("USER"));

router.post("/", submitRating);
router.put("/:id", updateRating);

export default router;