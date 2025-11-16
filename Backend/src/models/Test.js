import mongoose from "mongoose";

const SectionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    type: { type: String, enum: ["mcq", "coding"], required: true },
    questions: {
        type: [mongoose.Schema.Types.ObjectId],
        default: []       // <— THIS PREVENTS ERROR
    },
});

const TestSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },

        sections: [SectionSchema], // NEW STRUCTURE

        timeLimit: Number,
        totalMarks: Number,

        courseId: { type: String, required: true },
        sectionId: Number,
        chapterId: Number,

        createdBy: String,
    },
    { timestamps: true }
);

export default mongoose.models.Test ||
    mongoose.model("Test", TestSchema);
