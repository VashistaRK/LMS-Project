import express from "express";
import Faq from "../models/Faq.js";
import { requireAdmin } from "../middleware/roles.js";
import User from "../models/User.js";
import Course from "../models/Course.js";

const router = express.Router();

// List unanswered FAQs for admin UI
router.get("/faqs/unanswered", requireAdmin, async (req, res) => {
  try {
    const faqs = await Faq.find({ answer: "" })
      .sort({ createdAt: -1 })
      .limit(200);
    res.json(faqs);
  } catch (err) {
    console.error("Error fetching FAQs:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Answer a FAQ
router.post("/faqs/:id/answer", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { answer } = req.body;

    if (!id) return res.status(400).json({ message: "FAQ ID is required" });
    if (!answer || !answer.trim())
      return res.status(400).json({ message: "Answer is required" });

    const faq = await Faq.findByIdAndUpdate(
      id,
      {
        answer,
        answeredBy: "admin-system", // Replace with req.user.id when auth is enabled
        answeredAt: new Date(),
      },
      { new: true },
    );

    if (!faq) return res.status(404).json({ error: "FAQ not found" });

    // Emit real-time event if Socket.IO is set up
    req.app.get("io")?.to(faq.courseId).emit("faq:answered", faq);

    res.json(faq);
  } catch (err) {
    console.error("Error answering FAQ:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/users/:id/approve", requireAdmin, async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.accessGranted === true) {
    return res.status(400).json({ message: "Access already granted" });
  }

  user.accessGranted = true;
  await user.save();

  return res.json({
    message: "User access approved",
    accessGranted: true,
  });
});

router.post("/users/:id/revoke", requireAdmin, async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.accessGranted === false) {
    return res.status(400).json({ message: "Access already revoked" });
  }

  user.accessGranted = false;
  await user.save();

  return res.json({
    message: "User access revoked",
    accessGranted: false,
  });
});

router.post("/clean-invalid-purchases", requireAdmin, async (req, res) => {
  try {
    const users = await User.find({});

    // Step 1: get all valid UUID course IDs (NOT _id)
    const allCourses = await Course.find({}, "id"); // ← UUID field
    const validIds = new Set(allCourses.map((c) => c.id)); // UUIDs

    let cleanedCount = 0;

    for (const user of users) {
      if (!Array.isArray(user.startedCourses)) continue;

      const cleaned = user.startedCourses.filter((pc) => {
        // user purchase may look like: pc.id OR pc.courseId OR string
        const uuid =
          pc?.id ||
          pc?.courseId ||
          pc?.CourseId ||
          (typeof pc === "string" ? pc : null);

        return uuid && validIds.has(uuid);
      });

      if (cleaned.length !== user.startedCourses.length) {
        user.startedCourses = cleaned;
        await user.save();
        cleanedCount++;
      }
    }

    res.json({
      success: true,
      message: `Cleanup finished. ${cleanedCount} users updated.`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// --------------------------
// GET ALL USERS (Admin Only)
// --------------------------
router.get("/users", requireAdmin, async (req, res) => {
  try {
    const users = await User.find({})
      .select("-password") // never expose passwords
      .sort({ createdAt: -1 });

    res.json({ success: true, users });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --------------------------------------------------
// UPDATE USER (Admin) – name, email, role, status etc
// --------------------------------------------------
router.patch("/users/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Prevent dangerous fields from being updated accidentally
    const allowedFields = [
      "name",
      "email",
      "role",
      "isActive",
      "startedCourses",
      "phone",
    ];

    const safeUpdate = {};
    Object.keys(updates).forEach((key) => {
      if (allowedFields.includes(key)) {
        safeUpdate[key] = updates[key];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: safeUpdate },
      { new: true },
    ).select("-password");

    if (!updatedUser) return res.status(404).json({ error: "User not found" });

    res.json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
