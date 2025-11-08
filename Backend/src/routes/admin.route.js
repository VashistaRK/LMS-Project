import express from "express";
import Faq from "../models/Faq.js";
import { requireAdmin } from "../middleware/roles.js";
import User from "../models/User.js";
import PurchaseRequest from "../models/PurchaseRequest.js";

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
      { new: true }
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

router.post(
  "/purchase-requests/:id/approve",
  requireAdmin,
  async (req, res) => {
    const request = await PurchaseRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (request.status !== "pending")
      return res.status(400).json({ message: "already processed" });

    request.status = "approved";
    request.approvedAt = new Date();
    await request.save();

    // add courses to user
    const user = await User.findById(request.userId);

    request.courseIds.forEach((cid) => {
      if (!user.purchasedCourses.some((c) => c.CourseId === cid)) {
        user.purchasedCourses.push({
          CourseId: cid,
          completedChapters: [],
        });
      }
    });

    await user.save();

    return res.json({ message: "approved and courses added" });
  }
);

router.post("/purchase-requests/:id/reject", requireAdmin, async (req, res) => {
  const request = await PurchaseRequest.findById(req.params.id);
  if (!request) return res.status(404).json({ message: "Request not found" });

  if (request.status !== "pending")
    return res.status(400).json({ message: "already processed" });

  request.status = "rejected";
  await request.save();

  return res.json({ message: "request rejected" });
});

router.get("/purchase-requests", requireAdmin, async (req, res) => {
  const requests = await PurchaseRequest.find()
    .populate("userId", "name email")
    .populate("courseIds", "title");

  res.json({ requests });
});

export default router;
