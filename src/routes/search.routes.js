import express from "express";
import { searchTeachers } from "../controllers/searchController.js";

const router = express.Router();

router.get("/teachers", searchTeachers);

export default router;
