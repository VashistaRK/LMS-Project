import mongoose from "mongoose";
const { Schema } = mongoose;

const faqSchema = new Schema({
    courseId: { type: String, required: true, index: true },
    question: { type: String, required: true },
    askedBy: { type: String, required: true }, // user id
    askedAt: { type: Date, default: Date.now },
    answer: { type: String, default: "" },
    answeredBy: { type: String, default: "" },
    answeredAt: Date,
    votes: { type: Number, default: 0 },
    isModerated: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("Faq", faqSchema);
