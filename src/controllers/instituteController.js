import Institute from "../models/Institute.js";

export const createInstitute = async (req, res) => {
  try {
    const institute = await Institute.create(req.body);

    return res.status(201).json({
      success: true,
      data: institute
    });

  } catch (err) {
    // Duplicate email error (MongoDB unique index)
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
