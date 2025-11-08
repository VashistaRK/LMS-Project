import mongoose from "mongoose";

const purchasedCourseSchema = new mongoose.Schema(
    {
        CourseId: { type: String, required: true },
        completedChapters: { type: [String], default: [] },
        scores: { type: Map, of: Number, default: {} },
    },
    { _id: false }
);


const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: String,
    passwordHash: String,
    role: { type: String, default: "student" },
    picture: String,
    provider: { type: String, default: "local" },
    tokenVersion: { type: Number, default: 0 },

    purchasedCourses: [purchasedCourseSchema], // ✅ use the sub-schema
});

export default mongoose.model("User", userSchema);
