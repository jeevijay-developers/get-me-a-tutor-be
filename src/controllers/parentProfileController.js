import ParentProfile from "../models/ParentProfile.js";
export const ensureParentProfile = async (userId) => {
  let parent = await ParentProfile.findOne({ userId });

  if (!parent) {
    parent = await ParentProfile.create({ userId });
  }

  return parent;
};
// ---------------- CREATE PARENT PROFILE ----------------
export const createParentProfile = async (req, res) => {
  try {
    // ensure parent creates only one profile
    const exists = await ParentProfile.findOne({ userId: req.user._id });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Parent profile already exists",
      });
    }

    const parent = new ParentProfile({
      userId: req.user._id,
      ...req.body, // childrenIds (optional initially)
    });

    await parent.save();

    res.status(201).json({
      success: true,
      parent,
    });

  } catch (error) {
    console.error("createParentProfile error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ---------------- GET PARENT PROFILE BY ID ----------------
export const getParentProfile = async (req, res) => {
  try {
    const parent = await ParentProfile.findById(req.params.id)
      .populate("childrenIds");

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Parent profile not found",
      });
    }

    res.json({
      success: true,
      parent,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ---------------- UPDATE PARENT PROFILE ----------------
export const updateParentProfile = async (req, res) => {
  try {
    const parent = await ParentProfile.findOneAndUpdate(
      { userId: req.user._id },
      req.body,
      { new: true }
    );

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Parent profile not found",
      });
    }

    res.json({
      success: true,
      parent,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ---------------- DELETE PARENT PROFILE ----------------
export const deleteParentProfile = async (req, res) => {
  try {
    const deleted = await ParentProfile.findOneAndDelete({
      userId: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Parent profile not found",
      });
    }

    res.json({
      success: true,
      message: "Parent profile deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ---------------- GET MY PARENT PROFILE ----------------
export const getMyParentProfile = async (req, res) => {
  try {
    const parent = await ParentProfile.findOne({
      userId: req.user._id,
    }).populate("childrenIds");

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Parent profile not found",
      });
    }

    res.json({
      success: true,
      parent,
    });

  } catch (error) {
    console.error("getMyParentProfile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
