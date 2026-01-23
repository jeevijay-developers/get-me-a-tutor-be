import { createOrder } from "../services/razorpay.service.js";

export const createOrderController = async (req, res) => {
  try {
    const { userId, packId } = req.body;
    const order = await createOrder(userId, packId);
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
