import TeacherProfile from "../models/TeacherProfile.js";

export async function searchTeachers(req, res) { //institution, student, parent
  try {
    const {
      city,
      subject,
      minExperience,
      maxSalary,
      q,
      page = 1,
      limit = 10,
      sort = "experience",
    } = req.query;

    const filters = [];
    filters.push({ isPublic: true });

    if (city) {
      filters.push({ city: city });
    }

    if (subject) {
      filters.push({
        subjects: { $in: [subject] },
      });
    }

    if (minExperience) {
      filters.push({
        experienceYears: { $gte: Number(minExperience) },
      });
    }

    if (maxSalary) {
      filters.push({
        "expectedSalary.max": { $lte: Number(maxSalary) },
      });
    }

    if (q) {
      filters.push({
        $text: { $search: q },
      });
    }

    const query = filters.length ? { $and: filters } : {};

    let sortOption = {};
    if (sort === "experience") sortOption = { experienceYears: -1 };
    if (sort === "salary") sortOption = { "expectedSalary.min": 1 };
    if (sort === "latest") sortOption = { createdAt: -1 };

    const teachers = await TeacherProfile.find(query)
      .select("userId bio city subjects experienceYears expectedSalary isPublic")
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return res.json({
      success: true,
      page: Number(page),
      results: teachers.length,
      teachers,
    });
  } catch (err) {
    console.error("searchTeachers error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}
