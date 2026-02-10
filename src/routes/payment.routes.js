import express from "express";
import auth from "../middleware/auth.js";
import { createOrderController, verifyPaymentController } from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/create-order", auth, createOrderController);
router.post("/verify-payment", auth, verifyPaymentController);

export default router;
