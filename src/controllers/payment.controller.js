import { createOrder, verifyPaymentAndAddCredits } from "../services/razorpay.service.js";

export const createOrderController = async (req, res) => {
  try {
    // The createOrder function is now a controller function itself
    // Just calling it directly here
    await createOrder(req, res);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const verifyPaymentController = async (req, res) => {
  try {
    await verifyPaymentAndAddCredits(req, res);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
