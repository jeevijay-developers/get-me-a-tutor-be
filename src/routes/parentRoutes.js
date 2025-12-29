import express from "express";
import auth, { allowRoles } from "../middleware/auth.js";
import {
  createParentProfile,
  getParentProfile,
  updateParentProfile,
  deleteParentProfile,
  getMyParentProfile,
} from "../controllers/parentProfileController.js";

const router = express.Router();

router.post("/", auth, allowRoles("parent"), createParentProfile);
router.get("/my", auth, allowRoles("parent"), getMyParentProfile);
router.get("/:id", getParentProfile);
router.put("/", auth, allowRoles("parent"), updateParentProfile);
router.delete("/", auth, allowRoles("parent"), deleteParentProfile);

export default router;