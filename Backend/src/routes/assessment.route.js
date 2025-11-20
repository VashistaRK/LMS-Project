import { Router } from "express";
import AssessmentTrack from "../models/AssessmentTrack.js";
import AssessmentTest from "../models/AssessmentTest.js";
import AssessmentAttempt from "../models/AssessmentAttempt.js";
import QuizQuestion from "../models/quizQuestion.js";

const router = Router();

/* ============================================================
   ADMIN ENDPOINTS
   ============================================================ */

/**
 * Create a new assessment track
 */
router.post("/admin/tracks", async (req, res, next) => {
  try {
    const { title, description = "", slug, type = "MCQ" } = req.body;

    if (!title?.trim() || !slug?.trim()) {
      return res.status(400).json({ error: "title and slug are required" });
    }

    const existing = await AssessmentTrack.findOne({ slug }).lean();
    if (existing) {
      return res
        .status(409)
        .json({ error: "Track with this slug already exists" });
    }

    const track = await AssessmentTrack.create({
      title,
      description,
      slug,
      type,
    });

    res.status(201).json({ ok: true, track });
  } catch (e) {
    next(e);
  }
});

/**
 * Update a track (PATCH)
 */
router.patch("/admin/tracks/:slug", async (req, res, next) => {
  try {
    const { slug } = req.params;
    const payload = {
      title: req.body.title,
      description: req.body.description,
      // don't allow slug change here — keep slug immutable
      type: req.body.type,
    };

    const track = await AssessmentTrack.findOneAndUpdate(
      { slug },
      { $set: payload },
      { new: true }
    );

    if (!track) return res.status(404).json({ error: "Track not found" });

    res.json({ ok: true, track });
  } catch (e) {
    next(e);
  }
});

/**
 * Delete a track (DELETE)
 */
router.delete("/admin/tracks/:slug", async (req, res, next) => {
  try {
    const { slug } = req.params;
    const track = await AssessmentTrack.findOneAndDelete({ slug });
    if (!track) return res.status(404).json({ error: "Track not found" });

    // Optionally: cascade-delete tests/attempts belonging to this track,
    // or keep them depending on your desired behaviour.
    await AssessmentTest.deleteMany({ trackSlug: slug });
    await AssessmentAttempt.deleteMany({ trackSlug: slug });

    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

/**
 * Create or update a test (POST upsert)
 * Note: this route already acts as upsert (findOneAndUpdate with upsert: true)
 */
router.post("/admin/tests", async (req, res, next) => {
  try {
    const {
      trackSlug,
      testId,
      title,
      type = "Mixed",
      durationSec = 900,
      questionIds = [],
      meta = {},
    } = req.body;

    if (!trackSlug || !testId || !title) {
      return res.status(400).json({
        error: "trackSlug, testId, and title are required",
      });
    }

    const qIds = Array.isArray(questionIds)
      ? questionIds
          .map((q) => (typeof q === "string" ? q : q?._id || q?.id || null))
          .filter((id) => typeof id === "string")
      : [];

    // Validate all question IDs exist
    if (qIds.length > 0) {
      const found = await QuizQuestion.countDocuments({
        _id: { $in: qIds },
      });
      if (found !== qIds.length) {
        return res
          .status(400)
          .json({ error: "One or more questionIds are invalid" });
      }
    }

    const payload = {
      trackSlug,
      testId,
      title,
      type,
      durationSec: Number(durationSec) || 900,
      questionIds: qIds,
      meta,
    };

    const test = await AssessmentTest.findOneAndUpdate(
      { trackSlug, testId },
      payload,
      { new: true, upsert: true }
    );

    res.status(201).json({ ok: true, test });
  } catch (e) {
    next(e);
  }
});

/**
 * Update an existing test (PATCH)
 */
router.patch("/admin/tests/:slug/:testId", async (req, res, next) => {
  try {
    const { slug, testId } = req.params;
    const { title, type, durationSec, questionIds, meta } = req.body;

    // Validate question IDs if provided
    let qIds = undefined;
    if (questionIds !== undefined) {
      if (!Array.isArray(questionIds)) {
        return res.status(400).json({ error: "questionIds must be an array" });
      }
      qIds = questionIds.filter(Boolean);
      if (qIds.length > 0) {
        const found = await QuizQuestion.countDocuments({ _id: { $in: qIds } });
        if (found !== qIds.length) {
          return res
            .status(400)
            .json({ error: "One or more questionIds are invalid" });
        }
      }
    }

    const payload = {};
    if (title !== undefined) payload.title = title;
    if (type !== undefined) payload.type = type;
    if (durationSec !== undefined)
      payload.durationSec = Number(durationSec) || 900;
    if (qIds !== undefined) payload.questionIds = qIds;
    if (meta !== undefined) payload.meta = meta;

    const test = await AssessmentTest.findOneAndUpdate(
      { trackSlug: slug, testId },
      { $set: payload },
      { new: true }
    );

    if (!test) return res.status(404).json({ error: "Test not found" });

    res.json({ ok: true, test });
  } catch (e) {
    next(e);
  }
});

/**
 * Delete a test (DELETE)
 */
router.delete("/admin/tests/:slug/:testId", async (req, res, next) => {
  try {
    const { slug, testId } = req.params;
    const test = await AssessmentTest.findOneAndDelete({
      trackSlug: slug,
      testId,
    });
    if (!test) return res.status(404).json({ error: "Test not found" });

    // Optionally: remove attempts for this test
    await AssessmentAttempt.deleteMany({ trackSlug: slug, testId });

    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

/* ============================================================
   ADMIN: list attempts for a test
   ============================================================ */
router.get("/admin/tests/:slug/:testId/attempts", async (req, res, next) => {
  try {
    const { slug, testId } = req.params;
    const limit = Math.min(Number(req.query.limit) || 100, 500);

    const attempts = await AssessmentAttempt.find({
      trackSlug: slug,
      testId,
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const submitted = attempts.filter((a) => a.status === "submitted");
    const avgScore =
      submitted.length > 0
        ? submitted.reduce((s, a) => s + (a.score || 0), 0) / submitted.length
        : 0;

    res.json({
      total: attempts.length,
      submitted: submitted.length,
      avgScore,
      attempts,
    });
  } catch (e) {
    next(e);
  }
});

/* ============================================================
   PUBLIC ENDPOINTS
   ============================================================ */

/**
 * List all tracks
 */
router.get("/tracks", async (req, res, next) => {
  try {
    const tracks = await AssessmentTrack.find({}, { __v: 0 }).lean();
    res.json(tracks);
  } catch (e) {
    next(e);
  }
});

/**
 * List all tests in a track
 */
router.get("/tracks/:slug/tests", async (req, res, next) => {
  try {
    const tests = await AssessmentTest.find(
      { trackSlug: req.params.slug },
      { __v: 0 }
    ).lean();

    const out = tests.map((t) => ({
      _id: t._id,
      trackSlug: t.trackSlug,
      testId: t.testId,
      title: t.title,
      type: t.type,
      durationSec: t.durationSec,
      questionsCount: Array.isArray(t.questionIds) ? t.questionIds.length : 0,
    }));

    res.json(out);
  } catch (e) {
    next(e);
  }
});

/**
 * Get a single test definition
 */
router.get("/tracks/:slug/tests/:testId", async (req, res, next) => {
  try {
    const test = await AssessmentTest.findOne({
      trackSlug: req.params.slug,
      testId: req.params.testId,
    }).lean();

    if (!test) return res.status(404).json({ error: "Test not found" });

    res.json(test);
  } catch (e) {
    next(e);
  }
});

/**
 * Start an attempt
 */
router.post("/tracks/:slug/tests/:testId/start", async (req, res, next) => {
  try {
    const { slug, testId } = req.params;

    const test = await AssessmentTest.findOne({
      trackSlug: slug,
      testId,
    }).lean();

    if (!test) {
      return res.status(404).json({ error: "Test not found" });
    }

    const qDocs = await QuizQuestion.find({
      _id: { $in: test.questionIds },
    }).lean();

    const map = new Map(qDocs.map((q) => [String(q._id), q]));

    const questionsSnapshot = test.questionIds
      .map((id, index) => {
        const q = map.get(String(id));
        if (!q) return null;

        return {
          qIndex: index,
          type: q.type === "mcq" ? "MCQ" : "Descriptive",
          question: q.questionText || q.title || "",
          options: q.options || [],
          answer: q.type === "mcq" ? q.correctAnswer : null,
          points:
            q.meta?.points && !isNaN(Number(q.meta.points))
              ? Number(q.meta.points)
              : 1,
        };
      })
      .filter(Boolean);

    const sanitized = questionsSnapshot.map(
      ({ qIndex, type, question, options, points }) => ({
        qIndex,
        type,
        question,
        options,
        points,
      })
    );

    const attempt = await AssessmentAttempt.create({
      userId: req.user?._id || null,
      trackSlug: slug,
      testId,
      durationSec: test.durationSec,
      questionsSnapshot,
      answers: [],
      status: "active",
    });

    res.json({
      attemptId: attempt._id,
      durationSec: test.durationSec,
      title: test.title,
      questions: sanitized,
    });
  } catch (e) {
    next(e);
  }
});

/**
 * Submit attempt
 */
router.post("/attempts/:attemptId/submit", async (req, res, next) => {
  try {
    const { attemptId } = req.params;
    const { answers } = req.body;

    if (!Array.isArray(answers)) {
      return res.status(400).json({ error: "answers must be an array" });
    }

    const attempt = await AssessmentAttempt.findById(attemptId);
    if (!attempt || attempt.status !== "active") {
      return res.status(400).json({ error: "Invalid attempt" });
    }

    const snapshot = attempt.questionsSnapshot || [];
    let score = 0;

    const evaluated = answers.map((a) => {
      const q = snapshot[a.qIndex];
      if (!q) {
        return {
          qIndex: a.qIndex,
          value: a.value,
          correct: false,
          pointsAwarded: 0,
        };
      }

      let correct = null;
      let awarded = 0;

      if (q.type === "MCQ") {
        const submitted = a.value;
        const canonical = q.answer;

        if (!isNaN(Number(canonical)) && !isNaN(Number(submitted))) {
          correct = Number(submitted) === Number(canonical);
        } else {
          correct = String(submitted).trim() === String(canonical).trim();
        }

        awarded = correct ? q.points : 0;
      }

      score += awarded;

      return {
        qIndex: a.qIndex,
        value: a.value,
        correct,
        pointsAwarded: awarded,
      };
    });

    attempt.answers = evaluated;
    attempt.score = score;
    attempt.status = "submitted";
    attempt.endedAt = new Date();

    await attempt.save();

    const total = snapshot.reduce((sum, q) => sum + (q.points || 1), 0);

    res.json({ score, total, success: true });
  } catch (e) {
    next(e);
  }
});

/**
 * Terminate attempt early
 */
router.post("/attempts/:attemptId/terminate", async (req, res, next) => {
  try {
    const attempt = await AssessmentAttempt.findById(req.params.attemptId);

    if (!attempt || attempt.status !== "active") {
      return res.status(400).json({ error: "Invalid attempt" });
    }

    attempt.status = "terminated";
    attempt.endedAt = new Date();
    await attempt.save();

    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
