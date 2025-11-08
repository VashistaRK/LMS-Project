import mongoose from 'mongoose';

const AnswerSchema = new mongoose.Schema(
  {
    qIndex: { type: Number, required: true },
    // allow number|string for submitted answer (MCQ index or descriptive text)
    value: { type: mongoose.Schema.Types.Mixed, default: '' },
    correct: { type: Boolean, default: null },
    pointsAwarded: { type: Number, default: 0 },
  },
  { _id: false }
);

const QuestionSnapshotSchema = new mongoose.Schema(
  {
    qIndex: { type: Number, required: true },
    type: { type: String, enum: ['MCQ', 'Descriptive'], required: true },
    question: { type: String, required: true },
    options: [{ type: String }],
    // canonical answer (could be string or numeric index depending on how test stored)
    answer: { type: mongoose.Schema.Types.Mixed },
    points: { type: Number, default: 1 },
  },
  { _id: false }
);

const AssessmentAttemptSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    trackSlug: { type: String, required: true },
    testId: { type: String, required: true },
    status: { type: String, enum: ['active', 'submitted', 'terminated'], default: 'active' },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
    durationSec: { type: Number, required: true },
    // snapshot of questions at start time (immutable for grading)
    questionsSnapshot: [QuestionSnapshotSchema],
    answers: [AnswerSchema],
    score: { type: Number, default: 0 },
  },
  { timestamps: true }
);

AssessmentAttemptSchema.index({ userId: 1, trackSlug: 1, testId: 1, status: 1 });

export default mongoose.models.AssessmentAttempt || mongoose.model('AssessmentAttempt', AssessmentAttemptSchema);


