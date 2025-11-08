import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
  heading: { type: String, default: "" },
  content: { type: String, default: "" },
  type: { type: String, enum: ["text", "pdf"], default: "text" },
  fileUrl: { type: String, default: "" },
  fileSize: { type: Number, default: 0 },
  uploadedAt: { type: Date, default: Date.now }
}, { _id: false });

const docSchema = new mongoose.Schema({
  docId: { type: String, unique: true, required: true },
  content: { type: Object }, // stores BlockNote JSON for rich text editor
  notes: { type: [noteSchema], default: [] }, // manual text notes
  // Store PDF binary (gzipped) in DB and keep metadata
  pdfData: { type: Buffer }, // gzipped PDF bytes
  pdfGzipped: { type: Boolean, default: false },
  pdfMime: { type: String, default: 'application/pdf' },
  pdfSize: { type: Number, default: 0 }, // original PDF file size in bytes (uncompressed)
  pdfCompressedSize: { type: Number, default: 0 }, // size of stored gzipped buffer
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field on save
docSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("Doc", docSchema);