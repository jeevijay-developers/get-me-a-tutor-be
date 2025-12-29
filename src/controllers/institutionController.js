//create institution profile
import Institution from "../models/Institution.js";
import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";

export const createInstitutionProfile = async (req, res) => {
  try {
    const exists = await Institution.findOne({ owner: req.user._id });
    await User.findByIdAndUpdate(req.user._id, {
      hasInstituteProfile: true,
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Institution profile already exists",
      });
    }
    let logo = null;
    if (req.files?.logo?.[0]) {
      const uploadedLogo = await cloudinary.uploader.upload(
        req.files.logo[0].path,
        { folder: "institutions/logos" }
      );
      logo = uploadedLogo.secure_url;
    }

    let galleryImages = [];
    if (req.files?.galleryImages?.length > 0) {
      for (const file of req.files.galleryImages) {
        const uploaded = await cloudinary.uploader.upload(file.path, {
          folder: "institutions/gallery",
        });
        galleryImages.push(uploaded.secure_url);
      }
    }

    const institution = new Institution({
      owner: req.user._id,
      ...req.body,
      logo,
      galleryImages,
    });

    await institution.save();

    res.status(201).json({
      success: true,
      institution,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//get institution profile
export const getInstitutionProfile = async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.id);

    if (!institution) {
      return res.status(404).json({
        success: false,
        message: "Institution not found",
      });
    }

    res.json({ success: true, institution });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET my institution profile (by logged-in user)
export const getMyInstitutionProfile = async (req, res) => {
  try {
    const institution = await Institution.findOne({
      owner: req.user._id,
    });

    if (!institution) {
      return res.status(404).json({
        success: false,
        message: "Institution profile not found",
      });
    }

    res.json({
      success: true,
      institution,
    });
  } catch (error) {
    console.error("getMyInstitutionProfile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

//update institution profile
export const updateInstitutionProfile = async (req, res) => {
  try {
    const institution = await Institution.findOneAndUpdate(
      { owner: req.user._id },
      req.body,
      { new: true }
    );

    if (!institution) {
      return res.status(404).json({
        success: false,
        message: "Institution profile not found",
      });
    }
    // 2️⃣ LOGO upload (if provided)
    if (req.files?.logo?.[0]) {
      const uploadedLogo = await cloudinary.uploader.upload(
        req.files.logo[0].path,
        {
          folder: "institutions/logos",
        }
      );

      institution.logo = uploadedLogo.secure_url;
    }

    // 3️⃣ GALLERY upload (if provided)
    if (req.files?.galleryImages?.length > 0) {
      const galleryUrls = [];

      for (const file of req.files.galleryImages) {
        const uploaded = await cloudinary.uploader.upload(file.path, {
          folder: "institutions/gallery",
        });
        galleryUrls.push(uploaded.secure_url);
      }

      // replace gallery (recommended)
      const existing = Array.isArray(req.body.galleryImages)
  ? req.body.galleryImages
  : req.body.galleryImages
  ? [req.body.galleryImages]
  : [];

institution.galleryImages = [
  ...existing,
  ...galleryUrls,
];
    }
    console.log('req.files:', req.files);
console.log('req.body keys:', Object.keys(req.body));

    await institution.save();

    res.json({
      success: true,
      institution,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//delete institution profile
export const deleteInstitutionProfile = async (req, res) => {
  try {
    const deleted = await Institution.findOneAndDelete({ owner: req.user._id });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Institution profile not found",
      });
    }
    await User.findByIdAndUpdate(req.user._id, {
      hasInstituteProfile: false,
    });
    res.json({
      success: true,
      message: "Institution profile deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
