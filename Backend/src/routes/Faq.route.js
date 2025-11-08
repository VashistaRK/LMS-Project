import express from "express";
import Faq from "../models/Faq.js";
// import { io } from "../../server.js"; // pattern: export socket server instance OR pass io in init

const router = express.Router();

// create question
router.post("/:courseId", async (req, res) => {
    const { courseId } = req.params;
    const { question, askedBy } = req.body; // askedBy from auth normally
    if (!question) return res.status(400).json({ error: "Question required" });
    const faq = await Faq.create({ courseId, question, askedBy });
    // broadcast to course room
    req.app.get("io")?.to(courseId).emit("faq:created", faq);
    res.status(201).json(faq);
});

// answer faq
router.post("/:id/answer", async (req, res) => {
    const { id } = req.params;
    const { answer, answeredBy } = req.body;
    const faq = await Faq.findByIdAndUpdate(id, { answer, answeredBy, answeredAt: new Date() }, { new: true });
    req.app.get("io")?.to(faq.courseId).emit("faq:answered", faq);
    res.json(faq);
});

// list faqs for course with pagination
router.get("/course/:courseId", async (req, res) => {
    const { courseId } = req.params;
    const faqs = await Faq.find({ courseId }).sort({ createdAt: -1 }).limit(200);
    res.json(faqs);
});

export default router;
