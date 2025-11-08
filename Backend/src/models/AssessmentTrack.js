import mongoose from 'mongoose';

const AssessmentTrackSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, index: true },
    description: { type: String, default: '' },
    slug: { type: String, required: true, unique: true, index: true },
  },
  { timestamps: true }
);

export default mongoose.models.AssessmentTrack || mongoose.model('AssessmentTrack', AssessmentTrackSchema);


