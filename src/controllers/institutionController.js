//create institution profile
import Institution from "../models/Institution.js";

export const createInstitutionProfile = async (req, res) => {
  try {
    // ensure institution user creates only one profile
    const exists = await Institution.findOne({ owner: req.user._id });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Institution profile already exists",
      });
    }

    const institution = new Institution({
      owner: req.user._id,
      ...req.body,
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

    res.json({
      success: true,
      message: "Institution profile deleted successfully",
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

