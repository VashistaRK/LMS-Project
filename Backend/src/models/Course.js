// models/Course.js
import mongoose from "mongoose";

// Chapter Schema
const chapterSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    duration: { type: String, default: "" },
    type: {
      type: String,
      enum: ["video", "quiz", "assignment"],
      default: "video",
    },
    isPreviewable: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
    video: { type: String, default: "" },
    testId: { type: String, default: "" },
    notesId: { type: String, default: "" },
    notes: {
      type: [{
        heading: { type: String, default: "" },
        content: { type: String, default: "" },
      },], default: []
    },
  },
  { _id: false }
);

// Section Schema
const sectionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    lectureCount: { type: Number, default: 0 },
    duration: { type: String, default: "" },
    chapters: { type: [chapterSchema], default: [] },
  },
  { _id: false }
);

// Education Schema
const educationSchema = new mongoose.Schema(
  {
    college: { type: String, required: true },
    degree: { type: String, required: true },
    year: { type: Number, required: true },
  },
  { _id: false }
);

// Instructor Schema
const instructorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    title: { type: String, default: "" },
    image: { type: String, default: "" },
    bio: { type: String, default: "" },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    students: { type: Number, default: 0 },
    courses: { type: Number, default: 0 },
    expertise: { type: [String], default: [] },
    education: { type: [educationSchema], default: [] },
    achivements: { type: [String], default: [] },
  },
  { _id: false }
);

// FAQ Schema
const faqSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, default: "" },
  },
  { _id: false }
);

// Review Schema
const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    avatar: { type: String, default: "" },
    rating: { type: Number, default: 0 },
    date: { type: String, default: "" },
    comment: { type: String, default: "" },
    helpful: { type: Number, default: 0 },
  },
  { _id: false }
);

// Thumbnail Schema
const thumbnailSchema = new mongoose.Schema(
  {
    data: Buffer,
    contentType: String,
  },
  { _id: false }
);

// Course Schema
const courseSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    shortDescription: { type: String, default: "" },
    thumbnail: { type: thumbnailSchema, default: null },
    price: { type: Number, default: 0 },
    discountPrice: { type: Number, default: 0 },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "expert"],
      default: "beginner",
    },
    category: { type: String, default: "" },
    technologies: { type: [String], default: [] },
    features: { type: [String], default: [] },
    duration: { type: String, default: "" },
    language: {
      type: String,
      enum: ["english", "spanish", "french", "german"],
      default: "english",
    },
    chapterCount: { type: Number, default: 0 },
    exerciseCount: { type: Number, default: 0 },
    prerequisites: { type: String, default: "" },
    learningOutcomes: { type: [String], default: [] },
    isPublished: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    allowComments: { type: Boolean, default: true },
    certificateEnabled: { type: Boolean, default: false },
    sections: { type: [sectionSchema], default: [] },
    instructor: { type: [instructorSchema], default: [] },
    faq: { type: [faqSchema], default: [] },
    reviews: { type: [reviewSchema], default: [] },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    studentCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Course", courseSchema);
