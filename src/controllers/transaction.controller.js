import Transaction from "../models/Transaction.js";

/**
 * ✅ GET MY TRANSACTIONS
 * - Fetch all transactions for the logged-in user
 * - Sort by newest first
 */
export const getMyTransactions = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id?.toString();

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const transactions = await Transaction.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      transactions,
    });
  } catch (error) {
    console.error("Get transactions error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch transactions",
    });
  }
};
