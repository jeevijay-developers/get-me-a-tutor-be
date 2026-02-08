import axios from "axios";
import Transaction from "../models/Transaction.js";
import crypto from "crypto";
import process from "process";

// Define credit packages (amount in paise)
const CREDIT_PACKS = {
  "10": { amount: 19900, credits: 10 },   // ₹199 for 10 credits
  "25": { amount: 39900, credits: 25 },   // ₹399 for 25 credits
  "50": { amount: 69900, credits: 50 },   // ₹699 for 50 credits
};

// Helper to map amount to credits
const amountToCreditsMap = {
  19900: 10,
  39900: 25,
  69900: 50
};

/**
 * ✅ TASK 2: Create Order
 */
export const createOrder = async (req, res) => {
  console.log("--- CREATE ORDER START ---");
  try {
    let { amount, credits, role } = req.body;
    const userId = req.user?.id || req.user?._id?.toString();

    // Ensure numeric types
    amount = Number(amount);
    credits = Number(credits);

    console.log(`Input: userId=${userId}, amount=${amount}, credits=${credits}, role=${role}`);

    if (!userId) {
      console.warn("Auth check failed: No userId");
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    if (!role || !["tutor", "institute"].includes(role)) {
      console.warn(`Role check failed: ${role}`);
      return res.status(403).json({ success: false, message: `Invalid role: ${role}` });
    }

    const expectedCredits = amountToCreditsMap[amount];
    if (!expectedCredits || credits !== expectedCredits) {
      console.warn(`Package validation failed: amount=${amount}, expectedCredits=${expectedCredits}, receivedCredits=${credits}`);
      return res.status(400).json({ success: false, message: "Invalid package or credits mismatch" });
    }

    // Direct Axios call to bypass buggy SDK normalization
    const shortReceipt = `rcpt_${Date.now().toString().slice(-8)}_${userId.slice(-8)}`;
    const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");

    const razorpayOptions = {
      amount: Math.round(amount),
      currency: "INR",
      receipt: shortReceipt,
      notes: {
        userId: userId.toString(),
        credits: credits.toString(), 
        role: role.toString(),
        timestamp: new Date().toISOString()
      }
    };

    console.log("Calling Razorpay API directly with Axios...");
    try {
      const response = await axios.post("https://api.razorpay.com/v1/orders", razorpayOptions, {
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/json"
        }
      });

      const order = response.data;
      console.log("✅ Order created via Direct Axios:", order.id);

      return res.json({
        success: true,
        order: {
          id: order.id,
          amount: order.amount,
          currency: order.currency,
        }
      });
    } catch (apiError) {
      console.error("❌ Razorpay Direct API Error:");
      if (apiError.response) {
        console.error("Status:", apiError.response.status);
        console.error("Data:", JSON.stringify(apiError.response.data, null, 2));
        return res.status(apiError.response.status).json({
          success: false,
          message: apiError.response.data?.error?.description || "Payment Gateway Error",
          error: apiError.response.data
        });
      } else {
        console.error("Network/Request Error:", apiError.message);
        return res.status(500).json({
          success: false,
          message: "Could not connect to Payment Gateway",
          error: apiError.message
        });
      }
    }
  } catch (error) {
    console.error("🔥 CRITICAL Internal Error in createOrder:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during order creation",
      error: error.message
    });
  }
};

/**
 * ✅ TASK 4: Verify Payment
 */
export const verifyPaymentAndAddCredits = async (req, res) => {
  console.log("--- VERIFY PAYMENT START ---");
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const userId = req.user?.id || req.user?._id?.toString();

    console.log(`Verifying: userId=${userId}, paymentId=${razorpay_payment_id}, orderId=${razorpay_order_id}`);

    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    // Verify signature
    const text = razorpay_order_id + "|" + razorpay_payment_id;
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      console.warn("Signature mismatch");
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    // Idempotency check
    const existingTransaction = await Transaction.findOne({ razorpayPaymentId: razorpay_payment_id });
    if (existingTransaction) {
      console.log("Duplicate payment detected");
      return res.json({ success: true, message: "Payment already processed", duplicate: true });
    }

    // Fetch payment details directly via Axios
    let payment;
    try {
      const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
      const response = await axios.get(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}`, {
        headers: { "Authorization": `Basic ${auth}` }
      });
      payment = response.data;
      console.log(`Fetched payment. Status: ${payment.status}`);
    } catch (fetchError) {
      console.error("Failed to fetch payment details:", fetchError.message);
      // Fallback to webhook handling
      return res.json({ success: true, message: "Payment verified. Credits will be added momentarily." });
    }

    if (payment.status !== "captured" && payment.status !== "authorized") {
      console.warn(`Payment not captured/authorized: ${payment.status}`);
      return res.json({ success: true, message: "Payment verified. Waiting for capture..." });
    }

    const credits = Number(payment.notes?.credits);
    if (!credits || isNaN(credits)) {
      console.error("No credits found in payment notes:", payment.notes);
      return res.status(400).json({ success: false, message: "Invalid credits in payment data" });
    }

    // Update credits
    const User = (await import("../models/User.js")).default;
    const user = await User.findByIdAndUpdate(userId, { $inc: { credits } }, { new: true });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Create record
    await Transaction.create({
      user: userId,
      type: "CREDIT_PURCHASE",
      credits,
      reason: "PAYMENT",
      razorpayPaymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      status: "SUCCESS",
      balanceAfter: user.credits,
    });

    console.log(`✅ Success: Updated credits for ${userId}. New balance: ${user.credits}`);

    return res.json({
      success: true,
      message: "Payment verified and credits added.",
      credits: user.credits
    });
  } catch (error) {
    console.error("🔥 CRITICAL Error in verifyPayment:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during verification",
      error: error.message
    });
  }
};

