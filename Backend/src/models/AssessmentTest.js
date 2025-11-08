import mongoose from 'mongoose';

const AssessmentTestSchema = new mongoose.Schema(
  {
    trackSlug: { type: String, required: true, index: true },
    testId: { type: String, required: true },
    title: { type: String, required: true },
    type: { type: String, default: 'Mixed' },
    durationSec: { type: Number, default: 900 },
    // store question references to question bank (QuizQuestion)
    questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'QuizQuestion' }],
    // optional snapshot metadata
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

AssessmentTestSchema.index({ trackSlug: 1, testId: 1 }, { unique: true });

export default mongoose.models.AssessmentTest || mongoose.model('AssessmentTest', AssessmentTestSchema);


