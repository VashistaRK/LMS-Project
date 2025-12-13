import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema({
  resumeId: { type: String, unique: true, required: true },

  title: { type: String, default: "" },
  authorName: { type: String, default: "" },

  // File info
  fileName: { type: String },
  fileType: { type: String },
  fileSize: { type: Number },
  fileBuffer: { type: Buffer }, // stores DOCX/PDF binary

  // Optional editor content (if you want to keep)
  content: { type: Object, default: {} },

  summary: { type: String, default: "" },
  tags: { type: [String], default: [] },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

resumeSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("Resume", resumeSchema);
