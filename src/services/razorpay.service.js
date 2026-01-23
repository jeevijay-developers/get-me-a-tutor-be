import razorpay from "../config/razorpay.js";

const CREDIT_PACKS = {
  basic: { amount: 50000, credits: 100 },
  pro:   { amount: 100000, credits: 250 },
};

export const createOrder = async (userId, packId) => {
  const pack = CREDIT_PACKS[packId];
  if (!pack) throw new Error("Invalid pack");

  return await razorpay.orders.create({
    amount: pack.amount,
    currency: "INR",
    receipt: `rcpt_${Date.now()}`,
    notes: {
      userId,
      credits: pack.credits,
    },
  });
};
