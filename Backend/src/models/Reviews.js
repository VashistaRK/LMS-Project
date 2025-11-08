import mongoose from "mongoose";
const { Schema } = mongoose;

const replySchema = new Schema({
    userId: String,
    comment: String,
    createdAt: { type: Date, default: Date.now },
}, { _id: false });

const reviewSchema = new Schema({
    courseId: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    userName: { type: String },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, default: "" },
    likes: { type: Number, default: 0 },
    replies: { type: [replySchema], default: [] },
    isApproved: { type: Boolean, default: true } // moderation flag
}, { timestamps: true });

export default mongoose.model("Review", reviewSchema);
