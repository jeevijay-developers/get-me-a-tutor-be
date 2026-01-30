import express from "express";
import { getMyTransactions } from "../controllers/transaction.controller.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/my", auth, getMyTransactions);

export default router;
