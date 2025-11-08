import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "QuizQuestion" }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Quiz", quizSchema);
