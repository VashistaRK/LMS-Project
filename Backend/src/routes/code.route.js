import express from "express";
import {
  getAllQuestions,
  getRandomQuestion,
  getQuestionById,
  submitSolution,
  createQuestion,
  updateQuestion,
  runCode,
} from "../controllers/coding.controller.js";

const router = express.Router();

router.get("/", getAllQuestions);
router.get("/random", getRandomQuestion);
router.get("/:id", getQuestionById);
router.post("/", createQuestion);
router.put("/:id", updateQuestion);

router.post("/run", runCode);
router.post("/submit", submitSolution);

export default router;
