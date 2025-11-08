// routes/admin.js
import express from 'express';
import { requireAdmin } from '../middleware/roles.js';
import User from '../models/User.js';
import Course from '../models/Course.js';

const router = express.Router();

router.get("/analysis", requireAdmin, async (req, res) => {
    try {
        const [users, courses] = await Promise.all([
            User.find({}), // ✅ No populate since purchasedCourses are strings
            Course.find({}),
        ]);

        // --- Total Counts ---
        const totalUsers = users.length;
        const totalCourses = courses.length;

        // --- Users by Role ---
        const byRole = users.reduce((acc, u) => {
            acc[u.role || "student"] = (acc[u.role || "student"] || 0) + 1;
            return acc;
        }, {});

        // --- Recent Signups (latest 10) ---
        const recentSignups = await User.find({})
            .sort({ createdAt: -1 })
            .limit(10)
            .select("name email");

        // --- Daily User Growth (last 30 days) ---
        const userGrowthAgg = await User.aggregate([
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);
        const userGrowth = userGrowthAgg.map(g => ({
            date: g._id,
            count: g.count,
        }));

        // --- Enrollments per Course ---
        const courseEnrollments = courses.map((c) => {
            const count = users.filter((u) =>
                (u.purchasedCourses || []).includes(c.id) // ✅ Match on Course.id
            ).length;
            return { course: c.title, count };
        });

        // --- Enrollment Trends (daily) ---
        const enrollmentAgg = await User.aggregate([
            { $unwind: "$purchasedCourses" },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { "_id.date": 1 } },
        ]);
        const enrollmentTrends = enrollmentAgg.map(g => ({
            date: g._id.date,
            count: g.count,
        }));

        // --- Per-user Course Counts ---
        const courseActivity = users
            .map((u) => ({
                user: u.name || u.email,
                courseCount: (u.purchasedCourses || []).length,
            }))
            .sort((a, b) => b.courseCount - a.courseCount);

        res.json({
            users: {
                total: totalUsers,
                byRole,
                recentSignups,
                growth: userGrowth,
                courseActivity,
            },
            courses: {
                total: totalCourses,
                enrollments: courseEnrollments,
                trends: enrollmentTrends,
            },
        });
    } catch (err) {
        console.error("Analysis API Error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
