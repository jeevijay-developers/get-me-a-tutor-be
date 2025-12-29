// src/controllers/parentProfileController.js
import ParentProfile from "../models/ParentProfile.js";
import StudentProfile from "../models/StudentProfile.js";

// helper – ensure parentProfile exists for logged-in parent
async function ensureParentProfile(userId) {
  let parent = await ParentProfile.findOne({ userId });
  if (!parent) {
    parent = await ParentProfile.create({ userId, childrenIds: [] });
  }
  return parent;
}

// GET /profile/parent/me  (role: parent)
export async function getMyParentProfile(req, res) {
  try {
    const userId = req.user._id;

    const parent = await ParentProfile.findOne({ userId })
      .populate("childrenIds");

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Parent profile not found",
      });
    }

    return res.json({
      success: true,
      parent,
    });
  } catch (err) {
    console.error("getMyParentProfile error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

// we export the helper so student controller can reuse
export { ensureParentProfile };
