import { Router } from "express";
import Resume from "../models/Resume.js";
import { requireAdmin } from "../middleware/roles.js";
import multer from "multer";

const router = Router();
const upload = multer(); // store in memory

// List resumes (supports simple pagination)
router.get("/", async (req, res) => {
  try {
    const page = Math.max(0, parseInt(req.query.page) || 0);
    const limit = Math.min(100, parseInt(req.query.limit) || 50);

    const [items, total] = await Promise.all([
      Resume.find()
        .select("-fileBuffer")
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

router.post("/upload", requireAdmin, upload.single("file"), async (req, res) => {
  try {
    const { resumeId, title, authorName, summary, tags } = req.body;

    if (!resumeId) {
      return res.status(400).json({ error: "resumeId is required" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const exists = await Resume.findOne({ resumeId });
    if (exists) return res.status(409).json({ error: "resumeId already exists" });

    const resume = new Resume({
      resumeId,
      title,
      authorName,
      summary,
      tags: tags ? tags.split(",") : [],

      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      fileBuffer: req.file.buffer,
    });

    await resume.save();
    res.status(201).json({ message: "Resume uploaded", resumeId });
  } catch (err) {
    console.error("❌ Upload resume error:", err);
    res.status(500).json({ error: "Failed to upload resume" });
  }
});

router.get("/:resumeId", async (req, res) => {
  try {
    const resume = await Resume.findOne({ resumeId: req.params.resumeId })
      .select("-fileBuffer")
      .lean();

    if (!resume) return res.status(404).json({ error: "Resume not found" });

    res.json(resume);
  } catch (err) {
    console.error("❌ Get resume error:", err);
    res.status(500).json({ error: "Failed to fetch resume" });
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

    const resume = await Resume.findOneAndUpdate(
      { resumeId: req.params.resumeId },
      { $set: req.body },
      { new: true }
    ).select("-fileBuffer");

    if (!resume) return res.status(404).json({ error: "Resume not found" });

    res.json(resume);
  } catch (err) {
    console.error("❌ Update resume error:", err);
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
