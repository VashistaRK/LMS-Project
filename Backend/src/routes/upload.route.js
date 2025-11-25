import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { uploadDocumentQuestions } from "../controllers/quiz.controller.js";

const router = express.Router();

/* ------------------------------------------------------------------
   FIX #1 — Resolve upload directory relative to the Backend folder
   /Backend/uploads  -> inside Docker maps to /app/uploads
------------------------------------------------------------------- */

// Get current file directory (because __dirname is not available in ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Upload folder path (always Backend/uploads)
const uploadDir = path.resolve(__dirname, "../uploads");

// Ensure folder exists
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("Uploads directory created:", uploadDir);
  }
} catch (err) {
  console.error("Failed creating uploads directory:", err);
}

/* ------------------------------------------------------------------
   FIX #2 — Proper Multer storage with extension preserved
------------------------------------------------------------------- */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // preserve .pdf / .docx
    const uniqueName =
      Date.now() + "-" + Math.random().toString(36).substring(2) + ext;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

/* ------------------------------------------------------------------
   Routes
------------------------------------------------------------------- */

// Upload document to generate MCQs
router.post("/upload-doc", upload.single("doc"), uploadDocumentQuestions);

export default router;
