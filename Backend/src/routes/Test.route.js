import express from "express";
import {
  createTest,
  getAllTests,
  getTest,
  updateTest,
  deleteTest,
  submitTest
} from "../controllers/Test.controller.js";

const router = express.Router();

router.post("/", createTest);
router.get("/", getAllTests);
router.get("/:testId", getTest);
router.put("/:testId", updateTest);
router.delete("/:testId", deleteTest);
router.post("/:testId/submit", submitTest);

export default router;
