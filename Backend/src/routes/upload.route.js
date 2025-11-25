import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

import { uploadDocumentQuestions } from "../controllers/quiz.controller.js";

const router = express.Router();

// Universal upload path (Docker + local)
const uploadPath = path.join(process.cwd(), "uploads");

// Ensure folder exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Route
router.post("/upload-doc", upload.single("doc"), uploadDocumentQuestions);

export default router;
