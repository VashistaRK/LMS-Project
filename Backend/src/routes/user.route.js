// routes/profile.js
import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middleware/auth.js";
import bcrypt from "bcryptjs";

const router = express.Router();

// GET /api/user/students-with-courses
router.get("/students-with-courses", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "admin" && req.user.role !== "Master_ADMIN") {
            return res.status(403).json({ error: "Forbidden" });
        }

        const students = await User.find({ role: "student" }).select(
            "-passwordHash"
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
        const user = await User.findById(req.params.userId).select(
            "purchasedCourses"
        );
        if (!user) return res.status(404).json({ error: "User not found" });

        res.json({ purchasedCourses: user.purchasedCourses || [] });
    } catch (err) {
        console.error("Error fetching purchased courses:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// GET current user profile
router.get("/profile", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id || req.user.sub).select(
            "-passwordHash"
        );
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json({ user });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// UPDATE profile
router.put("/profile", authMiddleware, async (req, res) => {
    try {
        const { name, picture, password } = req.body;
        const updates = {};

        if (name) updates.name = name;
        if (picture) updates.picture = picture;

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
            { new: true, runValidators: true }
        ).select("-passwordHash");

        res.json({ user: updatedUser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update profile" });
    }
});

// UPDATE profile with picture upload
router.put(
    "/profile",
    authMiddleware,
    upload.single("picture"),
    async (req, res) => {
      try {
        const { name, password } = req.body;
        const updates = {};
  
        if (name) updates.name = name;
  
        // If picture uploaded as file
        if (req.file) {
          const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
          updates.picture = base64Image; // store base64 directly OR upload to Cloudinary
        }
  
        // If picture provided as URL
        if (req.body.picture && !req.file) {
          updates.picture = req.body.picture;
        }
  
        // For password update
        if (password) {
          const user = await User.findById(req.user.id || req.user.sub);
          if (!user) return res.status(404).json({ error: "User not found" });
  
          if (user.provider !== "local") {
            return res.status(400).json({
              error: "Password change not allowed for OIDC users",
            });
          }
  
          updates.passwordHash = await bcrypt.hash(password, 12);
        }
  
        const updatedUser = await User.findByIdAndUpdate(
          req.user.id || req.user.sub,
          { $set: updates },
          { new: true, runValidators: true }
        ).select("-passwordHash");
  
        res.json({ user: updatedUser });
      } catch (err) {
        console.error("PROFILE UPDATE ERROR:", err);
        res.status(500).json({ error: "Failed to update profile" });
      }
    }
  );
  

// UPDATE completed chapters
router.put("/:userId/completed", async (req, res) => {
    try {
        const { courseId, chapterIds, score } = req.body;
        if (!courseId || !Array.isArray(chapterIds)) {
            return res.status(400).json({ error: "Invalid request body" });
        }

        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        const purchasedCourse = user.purchasedCourses.find(
            (c) => c.CourseId === courseId
        );
        if (!purchasedCourse)
            return res.status(400).json({ error: "Course not purchased" });

        purchasedCourse.completedChapters = Array.from(
            new Set([...(purchasedCourse.completedChapters || []), ...chapterIds])
        );

        // store score
        purchasedCourse.scores = purchasedCourse.scores || {};
        chapterIds.forEach((ch) => {
            purchasedCourse.scores.set(ch, score);
        });


        await user.save();

        res.json({
            message: "Completed chapters updated",
            completedChapters: purchasedCourse.completedChapters,
            scores: purchasedCourse.scores,
        });
    } catch (err) {
        console.error("Error updating completed chapters:", err);
        res.status(500).json({ error: "Server error" });
    }
});


export default router;
