// src/controllers/teacherProfileController.js
import TeacherProfile from "../models/TeacherProfile.js";
import User from "../models/User.js";

/**
 * Upsert teacher profile (create if missing, update if exists)
 * - Only the owner (req.user) should call this (use auth + allowRoles("tutor"))
 */
export async function upsertTeacherProfile(req, res) {
  try {
    const userId = req.user._id ? req.user._id.toString() : req.user.id;
    const payload = req.body || {};

    // validate minimal required fields optionally (you can extend)
    // e.g. if (!payload.bio) return res.status(400).json({ message: "bio required" });

    let profile = await TeacherProfile.findOne({ userId });

    if (!profile) {
      profile = await TeacherProfile.create({ userId, ...payload });
    } else {
      // Only update allowed fields (to avoid accidental overwrite)
      const allowed = [
        "bio","experienceYears","subjects","classes","languages",
        "city","expectedSalary","availability","resume","photo","demoVideoUrl",
        "isPublic","tags"
      ];
      allowed.forEach(key => {
        if (Object.prototype.hasOwnProperty.call(payload, key)) {
          profile[key] = payload[key];
        }
      });
      await profile.save();
    }

    return res.json({ message: "Profile saved", profile });
  } catch (err) {
    console.error("upsertTeacherProfile error:", err);
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
