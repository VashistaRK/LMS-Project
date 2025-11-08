import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  type: { type: String, enum: ['mcq', 'text'], required: true }, // 'mcq' or 'text'
  questionText: { type: String, required: true },
  options: [{ type: String }],             // only for mcq
  correctAnswer: { type: Number },         // index into options for mcq
  genre: { type: String, default: 'general' }, // <-- new field
  meta: { type: mongoose.Schema.Types.Mixed }, // optional extra data (courseId, chapter, etc)
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('QuizQuestion', questionSchema);
