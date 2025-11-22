/* routes/courses.js */
import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import Course from "../models/Course.js";
import multer from "multer";
import NotificationService from "../services/notificationService.js";
import { requireAdmin } from "../middleware/roles.js";
import path from "path";
import fs from "fs";

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fieldSize: 25 * 1024 * 1024 }, // 25MB for form fields
});

const router = Router();

/**
 * Helpers
 */
const isLikelyJsonString = (s) =>
  typeof s === "string" && (s.trim().startsWith("{") || s.trim().startsWith("["));

/**
 * Sanitize & normalize sections/chapters coming from client so mongoose validators don't fail
 * - ensure section.title is non-empty string
 * - ensure chapter.title is non-empty string
 * - enforce chapter.type allowed values and fallback to 'video'
 * - ensure arrays are arrays
 */
function sanitizeSections(rawSections) {
  if (!Array.isArray(rawSections)) return [];

  return rawSections.map((sec, sIdx) => {
    const title = (sec?.title ?? "").toString().trim() || `Section ${sIdx + 1}`;
    const lectureCount = Number.isFinite(Number(sec?.lectureCount))
      ? Number(sec.lectureCount)
      : (Array.isArray(sec?.chapters) ? sec.chapters.length : 0);

    const duration = sec?.duration ? String(sec.duration) : "";

    const chaptersRaw = Array.isArray(sec?.chapters) ? sec.chapters : [];

    const chapters = chaptersRaw.map((ch, cIdx) => {
      const chTitle = (ch?.title ?? "").toString().trim() || `Chapter ${cIdx + 1}`;
      const chDescription = ch?.description ?? "";
      const chDuration = ch?.duration ?? "";
      const allowedTypes = ["video", "quiz", "assignment"];
      const chType = allowedTypes.includes(ch?.type) ? ch.type : "video";
      const isPreviewable = !!ch?.isPreviewable;
      const tags = Array.isArray(ch?.tags) ? ch.tags.map(String) : (typeof ch?.tags === "string" ? ch.tags.split(",").map(t => t.trim()).filter(Boolean) : []);
      const video = ch?.video ? String(ch.video) : "";
      const testId = ch?.testId ? String(ch.testId) : "";
      const notesId = ch?.notesId ? String(ch.notesId) : "";
      const notes = Array.isArray(ch?.notes) ? ch.notes.map((n) => ({
        heading: n?.heading ? String(n.heading) : "",
        content: n?.content ? String(n.content) : ""
      })) : [];

      return {
        title: chTitle,
        description: chDescription,
        duration: chDuration,
        type: chType,
        isPreviewable,
        tags,
        video,
        testId,
        notesId,
        notes,
      };
    });

    return {
      title,
      lectureCount,
      duration,
      chapters,
    };
  });
}

/**
 * Create a new course
 */
router.post("/", requireAdmin, async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || String(title).trim() === "") {
      return res.status(400).json({ error: "Missing title" });
    }

    const course = new Course({
      id: uuidv4(),
      title: String(title).trim(),
      description: description ?? "",
      sections: Array.isArray(req.body.sections) ? req.body.sections : [],
    });

    const savedCourse = await course.save();

    // Notify (best-effort)
    try {
      await NotificationService.notifyCourseCreated(
        savedCourse.id,
        savedCourse.title,
        req.user?._id
      );
    } catch (notificationError) {
      console.warn("Notification failed (non-fatal)", notificationError);
    }

    res.status(201).json(savedCourse);
  } catch (err) {
    console.error("CREATE COURSE ERROR:", err);
    res.status(500).json({ error: "Failed to save course" });
  }
});

/**
 * Update a course (including thumbnail + instructor)
 * Accepts multipart/form-data (thumbnail file or JSON/text fields)
 */
router.put("/:courseId", requireAdmin, upload.single("thumbnail"), async (req, res) => {
  try {
    const { courseId } = req.params;
    // clone req.body (may contain strings for JSON fields)
    const updates = { ...req.body };

    // Parse any JSON-like strings into objects/arrays
    for (const key of Object.keys(updates)) {
      const raw = updates[key];
      if (isLikelyJsonString(raw)) {
        try {
          updates[key] = JSON.parse(raw);
        } catch (err) {
          // return clear client error for invalid JSON
          return res.status(400).json({ error: `Invalid JSON for field: ${key}` });
        }
      }
    }

    // If req.body.sections exists (string or object), parse & sanitize, then set updates.sections
    if (req.body.sections !== undefined) {
      try {
        const parsed = Array.isArray(req.body.sections) ? req.body.sections : (isLikelyJsonString(req.body.sections) ? JSON.parse(req.body.sections) : req.body.sections);
        updates.sections = sanitizeSections(parsed);
      } catch (err) {
        console.error("Error parsing/sanitizing sections:", err);
        return res.status(400).json({ error: "Invalid sections format" });
      }
    }

    // Thumbnail (file upload)
    if (req.file) {
      updates.thumbnail = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
    }

    // Make sure we don't attempt to set prohibited fields (optional safety)
    const prohibited = ["_id", "id", "createdAt", "updatedAt"];
    for (const p of prohibited) {
      if (updates[p] !== undefined) delete updates[p];
    }

    // Run update with validators, provide context for mongoose
    const course = await Course.findOneAndUpdate(
      { id: courseId },
      { $set: updates },
      { new: true, runValidators: true, context: "query" }
    );

    if (!course) return res.status(404).json({ error: "Course not found" });

    res.json(course);
  } catch (err) {
    // If mongoose validation error, return details
    if (err && err.name === "ValidationError") {
      const details = {};
      for (const k in err.errors) {
        details[k] = err.errors[k].message;
      }
      console.error("Validation error updating course:", details);
      return res.status(422).json({ error: "Validation failed", details });
    }

    console.error("UPDATE COURSE ERROR:", err);
    res.status(500).json({ error: "Failed to update course", details: err.message || String(err) });
  }
});

/**
 * Upload chapter-specific files (video/thumbnail)
 * :chapterId is interpreted as chapter title (case-insensitive) or notesId if exact match
 */
router.post(
  "/:courseId/chapters/:chapterId/upload",
  requireAdmin,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { courseId, chapterId } = req.params;
      const course = await Course.findOne({ id: courseId });
      if (!course) return res.status(404).json({ error: "Course not found" });

      const normalizedTarget = (chapterId || "").trim().toLowerCase();
      let targetChapter = null;

      for (const section of course.sections || []) {
        for (const chapter of section.chapters || []) {
          // allow matching by title or notesId
          if ((chapter.title || "").trim().toLowerCase() === normalizedTarget || (chapter.notesId || "") === chapterId) {
            targetChapter = chapter;
            break;
          }
        }
        if (targetChapter) break;
      }

      if (!targetChapter) {
        return res.status(404).json({ error: "Chapter not found by title or notesId" });
      }

      const uploadDir = path.join(process.cwd(), "uploads", "courses", courseId);
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      const saveBufferToFile = (file, prefix) => {
        const ext = path.extname(file.originalname) || "";
        const filename = `${prefix}-${Date.now()}${ext}`;
        const fullPath = path.join(uploadDir, filename);
        fs.writeFileSync(fullPath, file.buffer);
        return `/uploads/courses/${courseId}/${filename}`;
      };

      if (req.files && req.files["video"] && req.files["video"][0]) {
        const videoUrl = saveBufferToFile(req.files["video"][0], "chapter-video");
        targetChapter.video = videoUrl;
      }

      if (req.files && req.files["thumbnail"] && req.files["thumbnail"][0]) {
        const thumbFile = req.files["thumbnail"][0];
        // Save to course-level thumbnail; keep existing shape
        course.thumbnail = {
          data: thumbFile.buffer,
          contentType: thumbFile.mimetype,
        };
      }

      await course.save();
      return res.json({ message: "Chapter files uploaded", course });
    } catch (err) {
      console.error("Chapter upload error:", err);
      return res.status(500).json({ error: "Failed to upload chapter files", details: err.message || String(err) });
    }
  }
);

/**
 * Get all courses
 */
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    console.error("FETCH ALL COURSES ERROR:", err);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
});

/**
 * Get single course by ID
 */
router.get("/:courseId", async (req, res) => {
  try {
    const course = await Course.findOne({ id: req.params.courseId });
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json(course);
  } catch (err) {
    console.error("FETCH COURSE ERROR:", err);
    res.status(500).json({ message: "Failed to fetch course" });
  }
});

/**
 * Bulk fetch by ids
 */
router.post("/bulk-ids", async (req, res) => {
  let { ids } = req.body;
  if (!Array.isArray(ids)) return res.status(400).json({ error: "Invalid IDs" });
  ids = ids.filter((x) => typeof x === "string");
  const courses = await Course.find({ id: { $in: ids } });
  res.json({ courses });
});

/**
 * Course thumbnail (binary)
 */
router.get("/:courseId/thumbnail", async (req, res) => {
  try {
    const course = await Course.findOne({ id: req.params.courseId });
    if (!course || !course.thumbnail?.data) return res.status(404).json({ message: "Thumbnail not found" });
    res.set("Content-Type", course.thumbnail.contentType || "application/octet-stream");
    res.send(course.thumbnail.data);
  } catch (err) {
    console.error("THUMBNAIL FETCH ERROR:", err);
    res.status(500).json({ message: "Failed to fetch thumbnail" });
  }
});

/**
 * Delete a course
 */
router.delete("/:courseId", requireAdmin, async (req, res) => {
  try {
    const { courseId } = req.params;
    const deleted = await Course.findOneAndDelete({ id: courseId });
    if (!deleted) return res.status(404).json({ error: "Course not found" });
    res.json({ success: true, message: "Course deleted", id: courseId });
  } catch (err) {
    console.error("DELETE COURSE ERROR:", err);
    res.status(500).json({ error: "Failed to delete course" });
  }
});

/**
 * Related courses by category
 */
router.get("/:courseId/related", async (req, res) => {
  try {
    const { courseId } = req.params;
    const currentCourse = await Course.findOne({ id: courseId });
    if (!currentCourse) return res.status(404).json({ error: "Course not found" });
    const related = await Course.find({ id: { $ne: courseId }, category: currentCourse.category });
    res.json({ courses: related });
  } catch (err) {
    console.error("RELATED COURSES ERROR:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

/**
 * Assign/unassign students to a course by user IDs
 */
router.put("/:courseId/assign", requireAdmin, async (req, res) => {
  try {
    const { courseId } = req.params;
    let { userIds } = req.body;
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: "userIds must be a non-empty array" });
    }
    // Implementation remains same as your original
    const User = (await import("../models/User.js")).default;
    const updated = await User.updateMany(
      { _id: { $in: userIds } },
      {
        $addToSet: {
          purchasedCourses: {
            CourseId: courseId,
            completedChapters: [],
          },
        },
      }
    );
    return res.json({ message: "Users assigned", modifiedCount: updated.modifiedCount });
  } catch (err) {
    console.error("Assign users error:", err);
    return res.status(500).json({ error: "Failed to assign users" });
  }
});

router.put("/:courseId/unassign", requireAdmin, async (req, res) => {
  try {
    const { courseId } = req.params;
    let { userIds } = req.body;
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: "userIds must be a non-empty array" });
    }
    const User = (await import("../models/User.js")).default;
    const updated = await User.updateMany({ _id: { $in: userIds } }, { $pull: { purchasedCourses: { CourseId: courseId } } });
    return res.json({ message: "Users unassigned", modifiedCount: updated.modifiedCount });
  } catch (err) {
    console.error("Unassign users error:", err);
    return res.status(500).json({ error: "Failed to unassign users" });
  }
});

export default router;
