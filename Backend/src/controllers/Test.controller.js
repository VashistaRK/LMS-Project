import Test from '../models/Test.js';
import QuizQuestion from '../models/quizQuestion.js';
import CodingQuestion from '../models/codingQuestion.js';
import Course from '../models/Course.js';
import User from '../models/User.js';


/*
This module exports route handlers. It merges service/db logic with controllers
for simplicity while keeping routes separate.
*/


// Helpers / validation (simple)
const ensureArrayOfIds = (arr) => Array.isArray(arr) ? arr : [];


export const createTest = async (req, res) => {
    try {
        const {
            title,
            sections, // NEW
            timeLimit,
            totalMarks,
            courseId,
            sectionId,
            chapterId,
            createdBy,
        } = req.body;

        const test = await Test.create({
            title,
            sections,
            timeLimit,
            totalMarks,
            courseId,
            sectionId,
            chapterId,
            createdBy,
        });

        // make sure course exists first
        const course = await Course.findOne({ id: courseId });
        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        }

        // update using the SAME identifier
        await Course.updateOne(
            { id: courseId },
            {
                $set: {
                    [`sections.${sectionId}.chapters.${chapterId}.testId`]: test._id,
                },
            }
        );
        res.json({ success: true, testId: test._id, testData: test });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Test creation failed" });
    }
};

export const getAllTests = async (req, res, next) => {
    try {
        const tests = await Test.find().sort({ createdAt: -1 });
        res.json(tests);
    } catch (err) {
        next(err);
    }
};


export const getTest = async (req, res) => {
    try {
        const test = await Test.findById(req.params.testId);
        console.log("testId from params:", req.params.testId);

        if (!test) return res.status(404).json({ error: "Test not found" });

        // For each section, populate questions
        const sectionsWithQuestions = await Promise.all(
            test.sections.map(async (section) => {
                let questions = [];

                if (section.type === "mcq") {
                    questions = await QuizQuestion.find({
                        _id: { $in: section.questions },
                    });
                } else if (section.type === "coding") {
                    questions = await CodingQuestion.find({
                        _id: { $in: section.questions },
                    });
                }

                return {
                    ...section.toObject(),
                    questions, // full question objects
                };
            })
        );

        const testWithFullQuestions = {
            ...test.toObject(),
            sections: sectionsWithQuestions,
        };

        res.json(testWithFullQuestions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to load test with questions" });
    }
};

export const updateTest = async (req, res) => {
    try {
        const { testId } = req.params;
        const { title, sections, timeLimit, totalMarks } = req.body;

        const updated = await Test.findByIdAndUpdate(
            testId,
            {
                $set: {
                    title,
                    sections,
                    timeLimit,
                    totalMarks,
                },
            },
            { new: true }
        );

        res.json({ success: true, updated });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Update failed" });
    }
};



export const deleteTest = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deleted = await Test.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ message: 'Test not found' });
        res.json({ message: 'Test deleted successfully' });
    } catch (err) {
        next(err);
    }
};


// Extra endpoints to create question records (optional helpers)
export const createQuizQuestion = async (req, res, next) => {
    try {
        const payload = req.body;
        const q = await QuizQuestion.create(payload);
        res.status(201).json(q);
    } catch (err) {
        next(err);
    }
};


export const createCodingQuestion = async (req, res, next) => {
    try {
        const payload = req.body;
        const q = await CodingQuestion.create(payload);
        res.status(201).json(q);
    } catch (err) {
        next(err);
    }
};

export const submitTest = async (req, res) => {
    try {
        const { testId } = req.params;
        const { results, userId, courseId } = req.body;

        if (!userId || !courseId) {
            return res.status(400).json({ error: "Missing userId or courseId" });
        }

        // 1. Load test
        const test = await Test.findById(testId);
        if (!test) {
            return res.status(404).json({ error: "Test not found" });
        }

        let totalScore = 0;

        // 2. Evaluate each section
        for (let i = 0; i < test.sections.length; i++) {
            const section = test.sections[i];
            const sectionResult = results[i];

            if (!sectionResult) continue;

            // A) MCQ SECTION
            if (section.type === "mcq") {
                for (let q of section.questions) {
                    const submitted = sectionResult[q._id];
                    if (!submitted) continue;

                    const dbQ = await QuizQuestion.findById(q._id);
                    if (!dbQ) continue;

                    const submittedAnswer = sectionResult.answers[q._id];
                    if (submittedAnswer != null && String(submittedAnswer) === String(dbQ.answer)) {
                        totalScore += 1;
                    }
                }
            }

            // B) CODING SECTION
            if (section.type === "coding") {
                for (let q of section.questions) {
                    const submitted = sectionResult[q._id];
                    if (!submitted) continue;

                    const dbQ = await CodingQuestion.findById(q._id);
                    if (!dbQ) continue;

                    const submittedQ = sectionResult[q._id];
                    const passed = submittedQ?.passedCount || 0;
                    const total = submittedQ?.total || dbQ.testCases.length;

                    const sectionScore = Math.round((passed / total) * 5); // 5 points per coding q
                    totalScore += sectionScore;
                }
            }
        }

        // 3. Save score in user record

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        let purchasedCourse = user.purchasedCourses.find(
            (c) => c.CourseId === courseId
        );

        if (!purchasedCourse) {
            purchasedCourse = {
                CourseId: courseId,
                completedChapters: [],
                scores: {}
            };
            user.purchasedCourses.push(purchasedCourse);
        }

        purchasedCourse.scores.set(testId, totalScore);

        await user.save();

        res.json({
            success: true,
            totalScore,
            message: "Test submitted successfully"
        });
    } catch (err) {
        console.error("Submit test error:", err);
        res.status(500).json({ error: "Failed to submit test" });
    }
};