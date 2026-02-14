// routes/profile.js
import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middleware/auth.js";
import bcrypt from "bcryptjs";
import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "./uploads"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

const router = express.Router();

// GET /api/user/students-with-courses
router.get("/students-with-courses", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "Master_ADMIN") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const students = await User.find({ role: "student" }).select(
      "-passwordHash",
    );

    res.json({ students });
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/user/:userId/purchased-courses
router.get("/:userId/purchased-courses", async (req, res) => {
  try {
    // ensure we select the correct field name
    const user = await User.findById(req.params.userId).select(
      "startedCourses",
    );
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ startedCourses: user.startedCourses || [] });
  } catch (err) {
    console.error("Error fetching purchased courses:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET current user profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id || req.user.sub).select(
      "-passwordHash",
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.put(
  "/profile",
  authMiddleware,
  upload.single("picture"),
  async (req, res) => {
    try {
      const { name, password, picture } = req.body;
      const updates = {};

      if (name) updates.name = name;

      // ✅ FILE upload
      if (req.file) {
        updates.picture = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
      }

      // ✅ URL-based picture
      if (picture && !req.file) {
        updates.picture = picture;
      }

      // ✅ Password update
      if (password) {
        const user = await User.findById(req.user.id || req.user.sub);
        if (!user) return res.status(404).json({ error: "User not found" });

        if (user.provider !== "local") {
          return res
            .status(400)
            .json({ error: "Password change not allowed for OIDC users" });
        }

        updates.passwordHash = await bcrypt.hash(password, 12);
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.user.id || req.user.sub,
        { $set: updates },
        { new: true, runValidators: true },
      ).select("-passwordHash");

      res.json({ user: updatedUser });
    } catch (err) {
      console.error("PROFILE UPDATE ERROR:", err);
      res.status(500).json({ error: "Failed to update profile" });
    }
  },
);

// UPDATE completed chapters
router.put("/:userId/completed", async (req, res) => {
  try {
    let { courseId, chapterIds, score } = req.body;

    // Accept single chapterId string or an array
    if (!courseId) return res.status(400).json({ error: "Missing courseId" });
    if (!chapterIds)
      return res.status(400).json({ error: "Missing chapterIds" });

    if (!Array.isArray(chapterIds)) chapterIds = [chapterIds];

    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const startedCourse = user.startedCourses.find(
      (c) => c.CourseId === courseId,
    );
    if (!startedCourse)
      return res.status(400).json({ error: "Course not started" });

    // Merge and dedupe completed chapters
    startedCourse.completedChapters = Array.from(
      new Set([...(startedCourse.completedChapters || []), ...chapterIds]),
    );

    // Ensure scores container exists
    if (!startedCourse.scores) startedCourse.scores = {};

    // startedCourse.scores may be a Mongoose Map (with .set) or a plain object
    const isMapLike = typeof startedCourse.scores.set === "function";
    chapterIds.forEach((ch) => {
      if (score === undefined || score === null) return; // don't set undefined scores
      if (isMapLike) {
        startedCourse.scores.set(ch, Number(score));
      } else {
        startedCourse.scores[ch] = Number(score);
      }
    });

    await user.save();

    // Convert scores to plain object for JSON response
    let scoresObj = {};
    if (startedCourse.scores) {
      if (typeof startedCourse.scores.toObject === "function") {
        // Mongoose Map -> object
        scoresObj = startedCourse.scores.toObject();
      } else if (
        typeof startedCourse.scores.entries === "function" &&
        typeof Object.fromEntries === "function"
      ) {
        try {
          scoresObj = Object.fromEntries(startedCourse.scores.entries());
        } catch (e) {
          scoresObj = { ...startedCourse.scores };
        }
      } else {
        scoresObj = { ...startedCourse.scores };
      }
    }

    res.json({
      message: "Completed chapters updated",
      completedChapters: startedCourse.completedChapters,
      scores: scoresObj,
    });
  } catch (err) {
    console.error("Error updating completed chapters:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
