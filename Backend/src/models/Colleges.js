// models/College.js
import mongoose from "mongoose";

const collegeSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },  // short id like "cmr"
    name: { type: String, required: true },
    apiBase: { type: String, required: true },
    logo: { type: String, required: true },
    usersCount: { type: Number, default: 0 },
    coursesCount: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model("College", collegeSchema);
