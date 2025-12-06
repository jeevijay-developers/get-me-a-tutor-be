// src/controllers/studentProfileController.js
import StudentProfile from "../models/StudentProfile.js";
import ParentProfile from "../models/ParentProfile.js";
import { ensureParentProfile } from "./parentProfileController.js";

// POST /profile/student  (role: parent)
export async function createStudent(req, res) {
  try {
    const userId = req.user._id;

    // ensure that this parent has a ParentProfile doc
    const parentProfile = await ensureParentProfile(userId);

    const { name, board, className, city, gender } = req.body;

    if (!name || !className) {
      return res.status(400).json({
        success: false,
        message: "name and className are required",
      });
    }

    const student = await StudentProfile.create({
      parent: parentProfile._id,
      name,
      board,
      className,
      city,
      gender,
    });

    parentProfile.childrenIds.push(student._id);
    await parentProfile.save();

    return res.status(201).json({
      success: true,
      student,
    });
  } catch (err) {
    console.error("createStudent error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

// GET /profile/students  (role: parent)
export async function getMyStudents(req, res) {
  try {
    const userId = req.user._id;
    const parentProfile = await ParentProfile.findOne({ userId }).populate(
      "childrenIds"
    );

    if (!parentProfile) {
      return res.json({ success: true, students: [] });
    }

    return res.json({
      success: true,
      students: parentProfile.childrenIds,
    });
  } catch (err) {
    console.error("getMyStudents error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

// PUT /profile/student/:studentId  (role: parent)
export async function updateStudent(req, res) {
  try {
    const userId = req.user._id;
    const { studentId } = req.params;

    const parentProfile = await ParentProfile.findOne({ userId });
    if (!parentProfile) {
      return res.status(403).json({
        success: false,
        message: "Parent profile not found",
      });
    }

    // ensure this student belongs to this parent
    const student = await StudentProfile.findOneAndUpdate(
      { _id: studentId, parent: parentProfile._id },
      req.body,
      { new: true }
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found for this parent",
      });
    }

    return res.json({ success: true, student });
  } catch (err) {
    console.error("updateStudent error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

// DELETE /profile/student/:studentId  (role: parent)
export async function deleteStudent(req, res) {
  try {
    const userId = req.user._id;
    const { studentId } = req.params;

    const parentProfile = await ParentProfile.findOne({ userId });
    if (!parentProfile) {
      return res.status(403).json({
        success: false,
        message: "Parent profile not found",
      });
    }

    const deleted = await StudentProfile.findOneAndDelete({
      _id: studentId,
      parent: parentProfile._id,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Student not found for this parent",
      });
    }

    // also remove from parent.childrenIds
    parentProfile.childrenIds = parentProfile.childrenIds.filter(
      (id) => id.toString() !== studentId
    );
    await parentProfile.save();

    return res.json({
      success: true,
      message: "Student removed",
    });
  } catch (err) {
    console.error("deleteStudent error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
