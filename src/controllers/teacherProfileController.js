// src/controllers/teacherProfileController.js
import TeacherProfile from "../models/TeacherProfile.js";
import User from "../models/User.js";

/**
 * Upsert teacher profile (create if missing, update if exists)
 * - Only the owner (req.user) should call this (use auth + allowRoles("tutor"))
 */
/**
 * Upsert teacher profile (create if missing, update if exists)
 * - Only the owner (req.user) should call this (use auth + allowRoles("tutor"))
 */
export async function upsertTeacherProfile(req, res) {
  try {
    const userId = req.user._id?.toString() || req.user.id;
    const payload = req.body || {};

    let profile = await TeacherProfile.findOne({ userId });

    await User.findByIdAndUpdate(req.user._id, {
      hasTeacherProfile: true,
    });

    if (req.body.removePhoto === "true") payload.photo = null;
    if (req.body.removeResume === "true") payload.resume = null;
    if (req.body.removeDemoVideo === "true") payload.demoVideoUrl = null;

    if (req.files?.photo?.[0]) {
      payload.photo = {
        url: req.files.photo[0].path,
        filename: req.files.photo[0].originalname,
        mimeType: req.files.photo[0].mimetype,
        size: req.files.photo[0].size,
      };
    }

    if (req.files?.resume?.[0]) {
      payload.resume = {
        url: req.files.resume[0].path,
        filename: req.files.resume[0].originalname,
        mimeType: req.files.resume[0].mimetype,
        size: req.files.resume[0].size,
      };
    }

    if (req.files?.demoVideo?.[0]) {
      payload.demoVideoUrl = req.files.demoVideo[0].path;
    }

    if (!profile) {
      profile = await TeacherProfile.create({
        userId,
        ...payload,
      });
    } else {
      const allowed = [
        "bio",
        "experienceYears",
        "subjects",
        "classes",
        "languages",
        "city",
        "expectedSalary",
        "availability",
        "resume",
        "photo",
        "demoVideoUrl",
        "isPublic",
        "tags",
      ];

      allowed.forEach((key) => {
        if (key in payload) {
          profile[key] = payload[key];
        }
      });

      await profile.save();
    }

    return res.json({ message: "Profile saved", profile });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
}




/**
 * Get teacher profile by userId
 * If profile.isPublic is false, only owner (req.user.id) may get it.
 */
export async function getTeacherProfile(req, res) {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ message: "userId required" });

    const profile = await TeacherProfile.findOne({ userId }).lean();
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    // If not public, allow only owner
    const requesterId = req.user?.id || req.user?._id?.toString();
    if (!profile.isPublic && (!requesterId || requesterId !== profile.userId.toString())) {
      return res.status(403).json({ message: "This profile is private" });
    }

    // optionally populate basic user info
    const owner = await User.findById(profile.userId).select("name email phone role").lean();
    return res.json({ profile, owner });
  } catch (err) {
    console.error("getTeacherProfile error:", err);
    return res.status(500).json({ message: "Server error" });
  }

}
