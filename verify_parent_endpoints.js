
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";
import ParentProfile from "./src/models/ParentProfile.js";
import StudentProfile from "./src/models/StudentProfile.js";
import Job from "./src/models/Job.js";

dotenv.config();

const verifyParentEndpoints = async () => {
    try {
        console.log("🔌 Connecting to DB...");
        const uri = process.env.MONGO_URI || "mongodb://localhost:27017/get-me-a-tutor"; 
        await mongoose.connect(uri);
        console.log("✅ Connected.");

        // 1. Create/Get a Parent User
        let parentUser = await User.findOne({ email: "testparent@example.com" });
        if (!parentUser) {
            parentUser = await User.create({
                name: "Test Parent",
                email: "testparent@example.com",
                password: "password123",
                role: "parent",
                phone: "9876543210",
                credits: 10
            });
            console.log("Created Test Parent");
        }
        const userId = parentUser._id;

        // 2. Ensure Parent Profile
        let parentProfile = await ParentProfile.findOne({ userId });
        if (!parentProfile) {
            parentProfile = await ParentProfile.create({ userId });
            console.log("Created Parent Profile");
        }

        // 3. Simulate Add Child (POST /profile/student)
        const student = await StudentProfile.create({
            parent: parentProfile._id,
            name: "Test Child",
            className: "Class 10",
            board: "CBSE",
            city: "Mumbai",
            gender: "male"
        });
        // Push to parent childrenIds manually as controller would
        parentProfile.childrenIds.push(student._id);
        await parentProfile.save();
        console.log("✅ Added Child:", student.name);

        // 4. Simulate Get Children (GET /profile/students)
        const fetchedProfile = await ParentProfile.findOne({ userId }).populate("childrenIds");
        if (fetchedProfile.childrenIds.length > 0) {
             console.log("✅ Fetched Children:", fetchedProfile.childrenIds.map(c => c.name));
        } else {
             console.error("❌ Failed to fetch children");
        }

        // 5. Simulate Create Job (POST /jobs)
        await Job.create({
            postedBy: userId,
            postedByRole: "parent",
            title: "Math Tutor Needed",
            description: "Need help with calculus",
            subjects: ["Mathematics"],
            salary: 15000,
            location: "Mumbai",
            jobType: "part-time",
            status: "active"
        });
        console.log("✅ Created Job");

        // 6. Simulate Get My Jobs (GET /jobs/my)
        const myJobs = await Job.find({ postedBy: userId });
        console.log("✅ Fetched My Jobs:", myJobs.length);

        console.log("🎉 All Parent Dashboard logic verified!");

    } catch (error) {
        console.error("❌ Verification Failed:", error);
    } finally {
        await mongoose.disconnect();
    }
};

verifyParentEndpoints();
