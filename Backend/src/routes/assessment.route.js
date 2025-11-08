import { Router } from 'express';
import AssessmentTrack from '../models/AssessmentTrack.js';
import AssessmentTest from '../models/AssessmentTest.js';
import AssessmentAttempt from '../models/AssessmentAttempt.js';
import QuizQuestion from '../models/quizQuestion.js';

const router = Router();

// ----------------- Admin endpoints -----------------

// create a track
router.post('/admin/tracks', async (req, res, next) => {
  try {
    const { title, description, slug } = req.body;
    if (!title || !slug) return res.status(400).json({ error: 'title and slug are required' });
    const track = await AssessmentTrack.create({ title, description, slug });
    res.status(201).json({ ok: true, track });
  } catch (e) { next(e); }
});

// create or update a test using questionIds (selected from question bank)
router.post('/admin/tests', async (req, res, next) => {
  try {
    const { trackSlug, testId, title, type, durationSec, questionIds, meta } = req.body;
    if (!trackSlug || !testId || !title) return res.status(400).json({ error: 'trackSlug, testId, title required' });

    // validate questionIds (optional)
    const qIds = Array.isArray(questionIds) ? questionIds.filter(Boolean) : [];

    // ensure questions exist
    if (qIds.length > 0) {
      const found = await QuizQuestion.countDocuments({ _id: { $in: qIds } });
      if (found !== qIds.length) return res.status(400).json({ error: 'One or more questionIds are invalid' });
    }

    const payload = {
      trackSlug,
      testId,
      title,
      type: type || 'Mixed',
      durationSec: Number(durationSec) || 900,
      questionIds: qIds,
      meta: meta || {},
    };

    const created = await AssessmentTest.findOneAndUpdate(
      { trackSlug, testId },
      payload,
      { upsert: true, new: true }
    );

    res.status(201).json({ ok: true, test: created });
  } catch (e) { next(e); }
});

// list attempts for an admin test (summary)
router.get('/admin/tests/:slug/:testId/attempts', async (req, res, next) => {
  try {
    const { slug, testId } = req.params;
    const limit = Math.min(Number(req.query.limit) || 100, 500);
    const attempts = await AssessmentAttempt.find({ trackSlug: slug, testId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    const total = attempts.length;
    const submitted = attempts.filter(a => a.status === 'submitted');
    const avgScore = submitted.length ? submitted.reduce((s, a) => s + (a.score || 0), 0) / submitted.length : 0;
    res.json({ total, submitted: submitted.length, avgScore, attempts });
  } catch (e) { next(e); }
});

// ----------------- Public endpoints -----------------

// list tracks
router.get('/tracks', async (req, res, next) => {
  try {
    const tracks = await AssessmentTrack.find({}, { __v: 0 }).lean();
    res.json(tracks);
  } catch (e) { next(e); }
});

// list tests for a track (lightweight info)
router.get('/tracks/:slug/tests', async (req, res, next) => {
  try {
    const tests = await AssessmentTest.find({ trackSlug: req.params.slug }, { _id: 1, trackSlug: 1, testId: 1, title: 1, type: 1, durationSec: 1, questionIds: 1 }).lean();
    const mapped = tests.map(t => ({ _id: t._id, trackSlug: t.trackSlug, testId: t.testId, title: t.title, type: t.type, durationSec: t.durationSec, questionsCount: Array.isArray(t.questionIds) ? t.questionIds.length : 0 }));
    res.json(mapped);
  } catch (e) { next(e); }
});

// retrieve a single test metadata (no answers)
router.get('/tracks/:slug/tests/:testId', async (req, res, next) => {
  try {
    const test = await AssessmentTest.findOne({ trackSlug: req.params.slug, testId: req.params.testId }).lean();
    if (!test) return res.status(404).json({ error: 'Test not found' });
    res.json(test);
  } catch (e) { next(e); }
});

// Start an attempt: snapshot questions (pull from question bank) and return sanitized questions (no correct answers)
router.post('/tracks/:slug/tests/:testId/start', async (req, res, next) => {
  try {
    const { slug, testId } = req.params;
    const test = await AssessmentTest.findOne({ trackSlug: slug, testId }).lean();
    if (!test) return res.status(404).json({ error: 'Test not found' });

    // fetch questions from bank by ids and preserve order in test.questionIds
    const qDocs = await QuizQuestion.find({ _id: { $in: test.questionIds || [] } }).lean();
    // map by id
    const map = new Map(qDocs.map(q => [String(q._id), q]));
    // build ordered snapshot
    const questionsSnapshot = (test.questionIds || []).map((id, idx) => {
      const q = map.get(String(id));
      if (!q) return null;
      return {
        qIndex: idx,
        type: q.type === 'mcq' ? 'MCQ' : 'Descriptive',
        question: q.questionText || q.title || q.question || '',
        options: q.options || [],
        // canonical answer kept for grading
        answer: q.type === 'mcq' ? q.correctAnswer : null,
        points: (q.meta && q.meta.points) ? Number(q.meta.points) : 1,
      };
    }).filter(Boolean);

    // sanitized questions for client (no answer)
    const sanitizedQuestions = questionsSnapshot.map(({ qIndex, type, question, options, points }) => ({ qIndex, type, question, options, points }));

    // create attempt
    const attempt = await AssessmentAttempt.create({
      userId: req.user ? req.user._id : null,
      trackSlug: slug,
      testId,
      durationSec: test.durationSec,
      questionsSnapshot,
      answers: [],
      status: 'active',
    });

    res.json({ attemptId: attempt._id, durationSec: test.durationSec, title: test.title, questions: sanitizedQuestions });
  } catch (e) { next(e); }
});

// Submit attempt: grade using snapshot stored in attempt
router.post('/attempts/:attemptId/submit', async (req, res, next) => {
  try {
    const { attemptId } = req.params;
    const { answers } = req.body; // expected: [{ qIndex, value }]
    if (!Array.isArray(answers)) return res.status(400).json({ error: 'answers must be an array' });

    const attempt = await AssessmentAttempt.findById(attemptId);
    if (!attempt || attempt.status !== 'active') return res.status(400).json({ error: 'Invalid attempt' });

    const snapshot = attempt.questionsSnapshot || [];
    let score = 0;
    const evaluated = answers.map((a) => {
      const q = snapshot[a.qIndex];
      if (!q) return { qIndex: a.qIndex, value: a.value, correct: false, pointsAwarded: 0 };
      let correct = null;
      let pointsAwarded = 0;

      if (q.type === 'MCQ') {
        const submitted = a.value;
        const canonical = q.answer;
        if ((typeof canonical === 'number' || !isNaN(Number(canonical))) && !isNaN(Number(submitted))) {
          correct = Number(submitted) === Number(canonical);
        } else {
          correct = String(submitted).trim() === String(canonical).trim();
        }
        pointsAwarded = correct ? (q.points || 1) : 0;
      } else {
        // Descriptive - left for manual grading
        correct = null;
        pointsAwarded = 0;
      }

      score += pointsAwarded;
      return { qIndex: a.qIndex, value: a.value, correct, pointsAwarded };
    });

    attempt.answers = evaluated;
    attempt.score = score;
    attempt.status = 'submitted';
    attempt.endedAt = new Date();
    await attempt.save();

    const total = snapshot.reduce((s, q) => s + (q.points || 1), 0);

    res.json({ score, total, success: true });
  } catch (e) { next(e); }
});

// terminate attempt early
router.post('/attempts/:attemptId/terminate', async (req, res, next) => {
  try {
    const { attemptId } = req.params;
    const attempt = await AssessmentAttempt.findById(attemptId);
    if (!attempt || attempt.status !== 'active') return res.status(400).json({ error: 'Invalid attempt' });
    attempt.status = 'terminated';
    attempt.endedAt = new Date();
    await attempt.save();
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;


