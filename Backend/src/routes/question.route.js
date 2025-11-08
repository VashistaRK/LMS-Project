import express from "express";
import multer from "multer";
import {
  generateQuiz,
  getAllQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getGenres,
  uploadDocumentQuiz,
  getQuizById
} from "../controllers/quiz.controller.js";
import { validateQuestion } from "../middleware/questionValidation.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/:courseId/:sectionId/:chapterId/upload-doc", upload.single("doc"), uploadDocumentQuiz);
router.get("/quiz/:quizId", getQuizById);

// 🧩 Auto-generate quiz from content
router.post("/generate", generateQuiz);

// genres
router.get("/genres", getGenres);

// 🧩 CRUD routes
router.get("/", getAllQuestions);
router.get("/:id", getQuestionById);
router.post("/", validateQuestion, createQuestion);
router.put("/:id", validateQuestion, updateQuestion);
router.delete("/:id", deleteQuestion);

export default router;
