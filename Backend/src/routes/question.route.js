import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  generateQuiz,
  getAllQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getGenres,
  uploadDocumentQuiz,
  getQuizById,
  uploadDocumentQuestions
} from "../controllers/quiz.controller.js";
import { validateQuestion } from "../middleware/questionValidation.js";

const router = express.Router();

// Ensure uploads directory exists and use an absolute path so multer can
// write files reliably across environments (avoids EACCES on some hosts).
const uploadDir = path.resolve(process.cwd(), "uploads");
try {
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
} catch (err) {
  console.error("Failed to create uploads directory:", err);
}

const upload = multer({ dest: uploadDir });
router.get("/", getAllQuestions);

router.get("/quiz/:quizId", getQuizById);
router.post("/upload-doc", upload.single("doc"), uploadDocumentQuestions);
// 🧩 Auto-generate quiz from content
router.post("/generate", generateQuiz);
// genres
router.get("/genres", getGenres);

// 🧩 CRUD routes
router.get("/:id", getQuestionById);
router.post("/", validateQuestion, createQuestion);
router.put("/:id", validateQuestion, updateQuestion);
router.delete("/:id", deleteQuestion);

router.post("/:courseId/:sectionId/:chapterId/upload-doc", upload.single("doc"), uploadDocumentQuiz);

export default router;
