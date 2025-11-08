// routes/collegeRoutes.js
import express from "express";
import College from "../models/Colleges.js";

const router = express.Router();

// ✅ Get all colleges
router.get("/", async (req, res) => {
    try {
        const colleges = await College.find();
        res.json(colleges);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ✅ Add a new college
router.post("/", async (req, res) => {
    try {
        const college = new College(req.body);
        await college.save();
        res.status(201).json(college);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// ✅ Update counts for a college
router.put("/:id/stats", async (req, res) => {
    try {
        const { name, apiBase, logo, usersCount, coursesCount } = req.body;
        const college = await College.findOneAndUpdate(
            { id: req.params.id },
            { name, apiBase, logo, usersCount, coursesCount },
            { new: true }
        );
        if (!college) return res.status(404).json({ message: "College not found" });
        res.json(college);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});
// ✅ Get single college by custom string id (e.g., "CMR")
router.get("/:id", async (req, res) => {
    try {
        const college = await College.findOne({ id: req.params.id }); // match custom id
        if (!college) {
            return res.status(404).json({ message: "College not found" });
        }
        res.json(college);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



export default router;
