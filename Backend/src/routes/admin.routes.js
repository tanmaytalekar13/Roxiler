import express from "express";
import {
  getDashboard,
  addUser,
  addStore,
  getUsers,
  getStores,
  getUserById,
} from "../controllers/admin.controller.js";
import authenticate from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";

const router = express.Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/dashboard", getDashboard);
router.post("/users", addUser);
router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.post("/stores", addStore);
router.get("/stores", getStores);

export default router;