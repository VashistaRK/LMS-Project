import mongoose from 'mongoose';

// paper now stores the uploaded file as buffer
const PaperSchema = new mongoose.Schema({
  title: { type: String, required: true },
  year: { type: Number, required: true },
  // file stored inline as buffer
  file: {
    data: { type: Buffer },
    contentType: { type: String },
    filename: { type: String },
  },
  createdAt: { type: Date, default: Date.now }
}, { _id: true }); // keep _id so we can reference/download

const CompanyTestSectionSchema = new mongoose.Schema({
  key: { type: String, enum: ['mcq', 'coding', 'essay'], required: true },
  title: { type: String, default: '' },
  questionIds: { type: [mongoose.Schema.Types.ObjectId], default: [] },
  pointsPerQuestion: { type: Number, default: 1 }
}, { _id: false });

const CompanyTestSchema = new mongoose.Schema({
  testId: { type: String, required: true },
  title: { type: String, required: true },
  sections: { type: [CompanyTestSectionSchema], default: [] },
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

const CompanySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: { type: String, default: '' },
  guidance: { type: String, default: '' },
  papers: { type: [PaperSchema], default: [] },
  tests: { type: [CompanyTestSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

CompanySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.Company || mongoose.model('Company', CompanySchema);
