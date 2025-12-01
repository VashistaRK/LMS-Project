import mongoose from 'mongoose';

const AssessmentTestSchema = new mongoose.Schema(
  {
    trackSlug: { type: String, required: true, index: true },
    testId: { type: String, required: true },
    title: { type: String, required: true },
    durationSec: { type: Number, default: 900 },

    // Allow MCQ and Coding questions
    questionIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      }
    ],

    meta: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

// A test is uniquely identified by track + testId
AssessmentTestSchema.index({ trackSlug: 1, testId: 1 }, { unique: true });

export default mongoose.models.AssessmentTest ||
  mongoose.model('AssessmentTest', AssessmentTestSchema);
