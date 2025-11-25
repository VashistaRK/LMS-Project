import express from "express";
import path from "path";
import fs from "fs";
import { uploadDocumentQuestions } from "../controllers/quiz.controller.js";
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

router.post("/upload-doc", upload.single("doc"), uploadDocumentQuestions);

export default router;