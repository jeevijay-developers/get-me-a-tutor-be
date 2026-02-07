
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";
import TeacherProfile from "./src/models/TeacherProfile.js";

dotenv.config();

const verifyTeacherProfile = async () => {
    try {
        console.log("🔌 Connecting to DB...");
        const uri = process.env.MONGO_URI || "mongodb://localhost:27017/get-me-a-tutor"; 
        await mongoose.connect(uri);
        console.log("✅ Connected.");

        // 1. Create/Get a Teacher User
        let teacherUser = await User.findOne({ email: "testteacher@example.com" });
        if (!teacherUser) {
            teacherUser = await User.create({
                name: "Test Teacher",
                email: "testteacher@example.com",
                password: "password123",
                role: "tutor",
                phone: "9876543211",
                credits: 0
            });
            console.log("Created Test Teacher");
        }
        const userId = teacherUser._id;

        // 2. Ensure Teacher Profile
        let teacherProfile = await TeacherProfile.findOne({ userId });
        if (!teacherProfile) {
            teacherProfile = await TeacherProfile.create({
                userId,
                bio: "I am a test teacher demonstrating the profile feature.",
                experienceYears: 5,
                subjects: ["mathematics", "physics"],
                city: "delhi",
                languages: ["english", "hindi"],
                expectedSalary: { min: 500, max: 800 },
                availability: "Weekdays 4 PM - 8 PM"
            });
            console.log("Created Teacher Profile");
        }

        // 3. Simulate Get Profile (similar to /profile/teacher/profile/:id)
        const fetchedProfile = await TeacherProfile.findById(teacherProfile._id).populate("userId");
        
        if (fetchedProfile) {
             console.log("✅ Fetched Profile Successfully");
             console.log("   Name:", fetchedProfile.userId.name);
             console.log("   Bio:", fetchedProfile.bio);
             console.log("   Subjects:", fetchedProfile.subjects);
             console.log("   Languages:", fetchedProfile.languages);
             console.log("   Salary:", fetchedProfile.expectedSalary);
        } else {
             console.error("❌ Failed to fetch profile");
        }

    } catch (error) {
        console.error("❌ Verification Failed:", error);
    } finally {
        await mongoose.disconnect();
    }
};

verifyTeacherProfile();
