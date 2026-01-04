import { Router } from "express";
import mongoose from "mongoose";
import Resume from "../models/Resume.js";
import { requireAdmin } from "../middleware/roles.js";
import multer from "multer";

const router = Router();
// Limits and sizes
const MAX_MONGO_DOC_BYTES = 16 * 1024 * 1024; // 16MB Mongo document limit
const UPLOAD_LIMIT_BYTES = 10 * 1024 * 1024; // 10MB per-file multer limit (adjustable)

// store in memory for small files; keep a multer fileSize limit to avoid OOM on VPS
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: UPLOAD_LIMIT_BYTES },
});

// List resumes (supports simple pagination)
router.get("/", async (req, res) => {
  try {
    const page = Math.max(0, parseInt(req.query.page) || 0);
    const limit = Math.min(100, parseInt(req.query.limit) || 50);

    const [items, total] = await Promise.all([
      Resume.find()
        .select("-fileBuffer -imageBuffer")
        .sort({ updatedAt: -1 })
        .skip(page * limit)
        .limit(limit)
        .lean(),
      Resume.countDocuments(),
    ]);

    res.json({ items, total, page, limit });
  } catch (err) {
    console.error("❌ List resumes error:", err);
    res.status(500).json({ error: "Failed to list resumes" });
  }
});

router.post(
  "/upload",
  requireAdmin,
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { resumeId, title, authorName, summary, tags } = req.body;

      if (!resumeId) {
        return res.status(400).json({ error: "resumeId is required" });
      }

      const fileField = req.files && req.files.file ? req.files.file[0] : null;
      const imageField = req.files && req.files.image ? req.files.image[0] : null;

      if (!fileField) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Quick size checks before trying to persist into MongoDB document
      const fileBytes = fileField.size || 0;
      const imageBytes = imageField ? imageField.size || 0 : 0;

      if (fileBytes > MAX_MONGO_DOC_BYTES) {
        return res
          .status(413)
          .json({ error: "Uploaded file exceeds MongoDB document size (16MB). Use GridFS or external storage." });
      }

      if (fileBytes + imageBytes > MAX_MONGO_DOC_BYTES) {
        return res
          .status(413)
          .json({ error: "Combined file+image exceeds MongoDB document size (16MB). Use GridFS or external storage." });
      }

      console.info(`Resume upload: resumeId=${resumeId} fileBytes=${fileBytes} imageBytes=${imageBytes}`);

      const exists = await Resume.findOne({ resumeId });
      if (exists)
        return res.status(409).json({ error: "resumeId already exists" });

      const resume = new Resume({
        resumeId,
        title,
        authorName,
        summary,
        tags: tags ? tags.split(",") : [],
        fileName: fileField.originalname,
        fileType: fileField.mimetype,
        fileSize: fileField.size,
        fileBuffer: fileField.buffer,
        // optional template image
        imageFileName: imageField ? imageField.originalname : undefined,
        imageType: imageField ? imageField.mimetype : undefined,
        imageSize: imageField ? imageField.size : undefined,
        imageBuffer: imageField ? imageField.buffer : undefined,
      });

      try {
        await resume.save();
        res.status(201).json({ message: "Resume uploaded", resumeId });
      } catch (saveErr) {
        console.error("❌ Save resume error:", saveErr);
        // Detect common Mongo "document too large" / BSON errors
        const msg = (saveErr && saveErr.message) || "";
        if (msg.includes("BSONObjectTooLarge") || msg.toLowerCase().includes("document too large")) {
          return res.status(413).json({ error: "Document too large for MongoDB. Use GridFS or external storage." });
        }

        return res.status(500).json({ error: "Failed to save resume" });
      }
    } catch (err) {
      console.error("❌ Upload resume error:", err);

      // Multer file size errors often come here as a plain Error with message containing 'File too large'
      const emsg = (err && err.message) || "";
      if (emsg.toLowerCase().includes("file too large") || emsg.toLowerCase().includes("limit")) {
        return res.status(413).json({ error: "Uploaded file exceeds server limit" });
      }

      res.status(500).json({ error: "Failed to upload resume" });
    }
  }
);

// Lightweight DB health endpoint (useful on VPS to confirm local Mongo connection)
router.get("/health/db", async (req, res) => {
  try {
    const state = mongoose.connection.readyState; // 0 disconnected, 1 connected
    res.json({ ok: true, readyState: state });
  } catch (err) {
    console.error("❌ DB health check error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.get("/:resumeId", async (req, res) => {
  try {
    const resume = await Resume.findOne({ resumeId: req.params.resumeId })
      .select("-fileBuffer -imageBuffer")
      .lean();

    if (!resume) return res.status(404).json({ error: "Resume not found" });

    res.json(resume);
  } catch (err) {
    console.error("❌ Get resume error:", err);
    res.status(500).json({ error: "Failed to fetch resume" });
  }
});

// Serve stored template image (if any)
router.get("/:resumeId/image", async (req, res) => {
  try {
    const resume = await Resume.findOne({ resumeId: req.params.resumeId });

    if (!resume || !resume.imageBuffer) {
      return res.status(404).json({ error: "Image not found" });
    }

    res.setHeader(
      "Content-Type",
      resume.imageType || "application/octet-stream"
    );
    // small caching
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(resume.imageBuffer);
  } catch (err) {
    console.error("❌ Get resume image error:", err);
    res.status(500).json({ error: "Failed to fetch image" });
  }
});

router.get("/:resumeId/download", async (req, res) => {
  try {
    const resume = await Resume.findOne({ resumeId: req.params.resumeId });

    if (!resume || !resume.fileBuffer) {
      return res.status(404).json({ error: "File not found" });
    }

    res.setHeader("Content-Type", resume.fileType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${resume.fileName}"`
    );

    res.send(resume.fileBuffer);
  } catch (err) {
    console.error("❌ Download resume error:", err);
    res.status(500).json({ error: "Failed to download file" });
  }
});

router.put("/:resumeId", requireAdmin, async (req, res) => {
  try {
    delete req.body.fileBuffer;
    delete req.body.fileName;
    delete req.body.fileType;
    delete req.body.fileSize;
    delete req.body.imageBuffer;
    delete req.body.imageFileName;
    delete req.body.imageType;
    delete req.body.imageSize;
    delete req.body.resumeId;
    delete req.body._id;
    delete req.body.createdAt;
    delete req.body.updatedAt;

    const resume = await Resume.findOneAndUpdate(
      { resumeId: req.params.resumeId },
      { $set: req.body },
      { new: true, runValidators: true }
    ).select("-fileBuffer -imageBuffer");

    if (!resume) return res.status(404).json({ error: "Resume not found" });

    res.json(resume);
  } catch (err) {
    console.error("❌ Update resume error:", err);
    if (err && err.name === "ValidationError") {
      return res.status(422).json({ error: "Validation failed", details: err.message });
    }
    res.status(500).json({ error: "Failed to update resume" });
  }
});

router.delete("/:resumeId", requireAdmin, async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({
      resumeId: req.params.resumeId,
    });

    if (!resume) return res.status(404).json({ error: "Resume not found" });

    res.json({ message: "Resume deleted", resumeId: req.params.resumeId });
  } catch (err) {
    console.error("❌ Delete resume error:", err);
    res.status(500).json({ error: "Failed to delete resume" });
  }
});

export default router;
