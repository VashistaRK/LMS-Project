import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import Course from "../models/Course.js";
import multer from "multer";
// import Question from "../models/quizQuestion.js";
// import Quiz from "../models/AssessmentTest.js";
import NotificationService from "../services/notificationService.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { requireAdmin } from "../middleware/roles.js";
import path from "path";
import fs from "fs";

const storage = multer.memoryStorage(); // store in memory as Buffer
const upload = multer({
    storage, limits: {
        fieldSize: 25 * 1024 * 1024
    }
});

const router = Router();

// router.post(
//   '/:courseId/sections/:sectionId/upload-quiz',
//   requireAdmin,
//   upload.single('file'),
//   async (req, res) => {
//     try {
//       const { courseId, sectionId } = req.params;
//       const file = req.file;
//       if (!file) return res.status(400).json({ error: 'file required' });

//             // extract text - do dynamic import to avoid module-initialization crashes
//             let text = '';
//             try {
//                 const pdfParseModule = await import('pdf-parse');
//                 // pdf-parse may export the function as default or module itself
//                 const pdfParseFn = pdfParseModule.default || pdfParseModule;
//                 const data = await pdfParseFn(file.buffer);
//                 text = data?.text || '';
//             } catch (errPdfParse) {
//                 console.warn('pdf-parse failed or not installed, attempting pdfjs-dist fallback:', errPdfParse && errPdfParse.message);
//                 // try pdfjs-dist as a fallback
//                 try {
//                     const pdfjs = await import('pdfjs-dist/legacy/build/pdf.js');
//                     const loadingTask = pdfjs.getDocument({ data: file.buffer });
//                     const pdfDoc = await loadingTask.promise;
//                     const pageTexts = [];
//                     for (let p = 1; p <= pdfDoc.numPages; p++) {
//                         const page = await pdfDoc.getPage(p);
//                         const content = await page.getTextContent();
//                         const pageText = content.items.map((it) => it.str).join(' ');
//                         pageTexts.push(pageText);
//                     }
//                     text = pageTexts.join('\n\n');
//                 } catch (errPdfJs) {
//                     console.error('Both pdf-parse and pdfjs-dist failed to extract PDF text', errPdfJs);
//                     return res.status(500).json({ error: 'PDF parsing is not available on the server. Install "pdf-parse" or "pdfjs-dist".', details: String(errPdfJs && errPdfJs.message) });
//                 }
//             }

//       // naive parser (you will tune regex for your PDF layout)
//       const questions = parseQuestionsFromText(text); // implement below

//       // bulk insert into question bank
//       const created = await Question.insertMany(questions.map(q => ({ ...q, createdBy: req.user._id })));

//       // create quiz and assign to course section
//       const quiz = new Quiz({
//         title: `Auto-import ${new Date().toISOString()}`,
//         course: courseId,
//         section: sectionId,
//         questionIds: created.map(c => c._id),
//         createdBy: req.user._id,
//       });
//       await quiz.save();

//       // optionally update Course.sections[sectionId].quizzes.push(quiz._id) depending on schema
//       res.json({ ok: true, quizId: quiz._id, questionIds: created.map(c=>c._id) });
//     } catch (err) {
//       console.error('upload-quiz error', err);
//       res.status(500).json({ error: String(err.message || err) });
//     }
//   }
// );

// // helper parser (very basic)
// function parseQuestionsFromText(text) {
//   // split on lines that start with numeric question numbers: "1." or "1)"
//   const blocks = text.split(/\n(?=\s*\d+[\.\)]\s)/g);
//   const result = [];
//   for (const b of blocks) {
//     const m = b.match(/^\s*(\d+)[\.\)]\s*(.+?)(?=(\n\s*[A-Z][\)\.]|\n\s*Answer:|\n\s*\d+[\.\)]|$))/s);
//     if (!m) continue;
//     const qtext = m[2].trim();
//     // try to extract options
//     const opts = [...b.matchAll(/\n\s*([A-Z])[\)\.]\s*(.+?)(?=\n\s*[A-Z][\)\.]|\n\s*Answer:|\n\s*\d+[\.\)]|$)/gs)].map(x=>x[2].trim());
//     // try to find answer like "Answer: B" or "Ans: B"
//     const ansMatch = b.match(/Answer[:\s]*([A-Z])\b/i);
//     const correctIndex = ansMatch ? (ansMatch[1].charCodeAt(0) - 65) : undefined;
//     const type = opts.length ? 'mcq' : 'essay';
//     result.push({
//       type,
//       questionText: qtext,
//       options: opts.length ? opts : undefined,
//       answerIndex: typeof correctIndex === 'number' ? correctIndex : undefined,
//       meta: {}
//     });
//   }
//   return result;
// }


// Authentication middleware
// const authenticateToken = async (req, res, next) => {
//     try {
//         const authHeader = req.headers.authorization;
//         const token = authHeader && authHeader.split(' ')[1];

//         if (!token) {
//             return res.status(401).json({ error: 'Access token required' });
//         }

//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         const user = await User.findById(decoded.userId);

//         if (!user) {
//             return res.status(401).json({ error: 'User not found' });
//         }

//         req.user = user;
//         next();
//     } catch (error) {
//         return res.status(401).json({ error: 'Invalid token' });
//     }
// };

/**
 * Create a new course
 */
router.post("/", requireAdmin, async (req, res) => {
    try {
        const { title, description } = req.body;

        if (!title) {
            return res.status(400).json({ error: "Missing title" });
        }

        const course = new Course({
            id: uuidv4(),
            title,
            description,
            chapters: [],
        });

        const savedCourse = await course.save();

        // Send notification to all users about new course
        try {
            await NotificationService.notifyCourseCreated(
                savedCourse.id,
                savedCourse.title,
                req.user._id
            );
        } catch (notificationError) {
            // Don't fail the course creation if notification fails
        }

        res.status(201).json(savedCourse);
    } catch (err) {
        res.status(500).json({ error: "Failed to save course" });
    }
});

/**
 * Update a course (including thumbnail + instructor)
 */
router.put("/:courseId", requireAdmin, upload.single("thumbnail"), async (req, res) => {
    try {
        const { courseId } = req.params;
        const updates = { ...req.body };

        // Parse any JSON-looking strings into objects/arrays
        for (const key of Object.keys(updates)) {
            if (typeof updates[key] === "string") {
                const value = updates[key].trim();
                if ((value.startsWith("{") && value.endsWith("}")) ||
                    (value.startsWith("[") && value.endsWith("]"))) {
                    try {
                        updates[key] = JSON.parse(value);
                    } catch (err) {
                        return res.status(400).json({ error: `Invalid JSON for field: ${key}` });
                    }
                }
            }
        }
        if (updates.sections) {
            let sections = req.body.sections;

            try {
                if (typeof sections === "string") {
                    sections = JSON.parse(sections); // parse only if it's a string
                }
            } catch (err) {
                console.error("Error parsing sections:", err);
                sections = [];
            }

        }

        // ✅ Handle thumbnail properly
        if (req.file) {
            updates.thumbnail = {
                data: req.file.buffer,
                contentType: req.file.mimetype,
            };
        }

        const course = await Course.findOneAndUpdate(
            { id: courseId },
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!course) return res.status(404).json({ error: "Course not found" });
        res.json(course);
    } catch (err) {
        res.status(500).json({ error: "Failed to update course" });
    }
});

/**
 * Upload chapter-specific files (video/thumbnail)
 * Interprets :chapterId as chapter title (case-insensitive).
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

            for (const section of course.sections) {
                for (const chapter of section.chapters) {
                    if ((chapter.title || "").trim().toLowerCase() === normalizedTarget) {
                        targetChapter = chapter;
                        break;
                    }
                }
                if (targetChapter) break;
            }

            if (!targetChapter) {
                return res.status(404).json({ error: "Chapter not found by title" });
            }

            const uploadDir = path.join(process.cwd(), "uploads", "courses", courseId);
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

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
                course.thumbnail = {
                    data: thumbFile.buffer,
                    contentType: thumbFile.mimetype,
                };
            }

            await course.save();
            return res.json({ message: "Chapter files uploaded", course });
        } catch (err) {
            console.error("Chapter upload error:", err);
            return res.status(500).json({ error: "Failed to upload chapter files" });
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
        res.status(500).json({ message: "Failed to fetch course" });
    }
});
router.post("/bulk-ids", async (req, res) => {
    let { ids } = req.body;
    if (!Array.isArray(ids)) return res.status(400).json({ error: "Invalid IDs" });

    // keep only strings
    ids = ids.filter((x) => typeof x === "string");

    const courses = await Course.find({ id: { $in: ids } });
    res.json({ courses });
});


router.get("/:courseId/thumbnail", async (req, res) => {
    try {
        const course = await Course.findOne({ id: req.params.courseId });
        if (!course || !course.thumbnail?.data) {
            return res.status(404).json({ message: "Thumbnail not found" });
        }

        res.set("Content-Type", course.thumbnail.contentType);
        res.send(course.thumbnail.data);
    } catch (err) {
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
        res.status(500).json({ error: "Failed to delete course" });
    }
});
router.get("/:courseId/related", async (req, res) => {
    try {
        const { courseId } = req.params;
        const currentCourse = await Course.findOne({ id: courseId });
        if (!currentCourse) return res.status(404).json({ error: "Course not found" });

        const related = await Course.find({
            id: { $ne: courseId },
            category: currentCourse.category
        });

        res.json({ courses: related });
    } catch (err) {
        console.error("Error fetching related courses:", err);
        res.status(500).json({ error: "Server error", details: err.message });
    }
});

/** Assign/unassign students to a course by user IDs */
router.put("/:courseId/assign", requireAdmin, async (req, res) => {
    try {
        const { courseId } = req.params;
        let { userIds } = req.body;

        if (!Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ error: "userIds must be a non-empty array" });
        }

        const course = await Course.findOne({ id: courseId });
        if (!course) return res.status(404).json({ error: "Course not found" });

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

        const updated = await User.updateMany(
            { _id: { $in: userIds } },
            { $pull: { purchasedCourses: { CourseId: courseId } } }
        );

        return res.json({ message: "Users unassigned", modifiedCount: updated.modifiedCount });
    } catch (err) {
        console.error("Unassign users error:", err);
        return res.status(500).json({ error: "Failed to unassign users" });
    }
});


export default router;
