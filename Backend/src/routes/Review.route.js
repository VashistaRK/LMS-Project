import express from "express";
import Review from "../models/Reviews.js";
import Course from "../models/Course.js";
import auth from "../middleware/auth.js";

const router = express.Router();

/**
 * POST /reviews/:courseId
 * Create a review for a course (only enrolled students)
 */
router.post("/:courseId", async (req, res) => {
    try {
        const { courseId } = req.params; // UUID string
        const { rating, comment } = req.body;
        const user = req.body.currentUser; // must be populated by auth middleware

        // if (!user || !user.id) {
        //     return res.status(401).json({ error: "Unauthorized" });
        // }

        // if (typeof rating !== "number") {
        //     return res.status(400).json({ error: "Rating must be a number" });
        // }

        // Find course by UUID string
        console.log(req.body);
        const course = await Course.findOne({ id: courseId });
        if (!course) return res.status(404).json({ error: "Course not found" });

        // if (!course.studentIds?.includes(user.id)) {
        //     return res.status(403).json({ error: "Only enrolled students can review" });
        // }

        const review = await Review.create({
            courseId,
            userId: user.id,
            userName: user.name,
            rating,
            comment: comment?.trim() || "",
        });

        // Emit real-time review event
        req.app.get("io")?.to(courseId).emit("review:created", review);

        res.status(201).json(review);
    } catch (err) {
        console.error("Review POST error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

/**
 * GET /reviews/course/:courseId
 * Fetch top reviews (sorted by rating desc, then latest)
 */
router.get("/course/:courseId", async (req, res) => {
    try {
        const { courseId } = req.params;
        const reviews = await Review.find({ courseId, isApproved: true })
            .sort({ rating: -1, createdAt: -1 }) // top reviews first
            .limit(200);
        res.json(reviews);
    } catch (err) {
        console.error("Review GET error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;
