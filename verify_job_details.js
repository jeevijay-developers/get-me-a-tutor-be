
import mongoose from "mongoose";
import dotenv from "dotenv";
import Job from "./src/models/Job.js";
import User from "./src/models/User.js";
import Institution from "./src/models/Institution.js";

dotenv.config();

const verifyJobDetails = async () => {
    try {
        console.log("🔌 Connecting to DB...");
        const uri = process.env.MONGO_URI || "mongodb://localhost:27017/get-me-a-tutor"; 
        await mongoose.connect(uri);
        console.log("✅ Connected.");

        // 1. Get any active job
        const job = await Job.findOne({ status: 'active' });
        
        if (!job) {
            console.log("⚠️ No active jobs found. Creating one...");
             // Create dummy institution if needed
            let inst = await Institution.findOne();
            if(!inst) {
                 const user = await User.create({
                    name: "Test Inst", email: "testinst_job@example.com", password: "123", role: "institute", credits: 100
                 });
                 inst = await Institution.create({ userId: user._id, institutionName: "Test Institute", city: "Delhi" });
            }

            const newJob = await Job.create({
                postedBy: inst.userId,
                postedByRole: "institute",
                institution: inst._id,
                title: "Test Physics Job",
                description: "Need physics tutor",
                subjects: ["Physics"],
                location: "Delhi",
                jobType: "part-time",
                salary: 20000,
                status: "active"
            });
            console.log("Created Test Job:", newJob._id);
            return; // Run again to fetch
        }

        console.log(`🔍 Fetching details for Job ID: ${job._id}`);

        // Simulate GET /jobs/:id
        const fetchedJob = await Job.findById(job._id)
            .populate("institution", "institutionName city logo about")
            .populate("postedBy", "name");

        if (fetchedJob) {
             console.log("✅ Fetched Job Successfully");
             console.log("   Title:", fetchedJob.title);
             console.log("   Institution:", fetchedJob.institution?.institutionName);
             console.log("   Location:", fetchedJob.location);
             console.log("   Salary:", fetchedJob.salary);
             console.log("   Status:", fetchedJob.status);
        } else {
             console.error("❌ Failed to fetch job");
        }

    } catch (error) {
        console.error("❌ Verification Failed:", error);
    } finally {
        await mongoose.disconnect();
    }
};

verifyJobDetails();
