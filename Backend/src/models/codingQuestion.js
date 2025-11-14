import mongoose, { Schema } from "mongoose";

const TestCaseSchema = new Schema({
  input: { type: [Schema.Types.Mixed], required: true },
  output: { type: Schema.Types.Mixed, required: true },
});

const CodingQuestionSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    examples: { type: [String], default: [] },
    constraints: { type: String, default: "" },
    starterCode: { type: String, required: true },
    functionName: { type: String, required: true },
    testCases: { type: [TestCaseSchema], default: [] },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },
    hints: { type: [String], default: [] },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("CodingQuestion", CodingQuestionSchema);
