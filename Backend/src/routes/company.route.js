import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Company from '../models/Company.js';
import QuizQuestion from '../models/quizQuestion.js';
import { requireAdmin } from '../middleware/roles.js';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// use memory storage so we get req.file.buffer
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

const router = Router();

// Public: list companies with available years
router.get('/', async (req, res) => {
  try {
    const companies = await Company.find({}, { name: 1, slug: 1, papers: 1, description: 1 }).lean();
    // For each company, compute unique years
    const result = companies.map(c => ({
      name: c.name,
      slug: c.slug,
      description: c.description,
      years: Array.from(new Set((c.papers || []).map(p => p.year))).sort((a,b) => b-a)
    }));
    res.json(result);
  } catch (err) {
    console.error('Error listing companies:', err);
    res.status(500).json({ error: 'Failed to list companies' });
  }
});

// Public: get company details
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const comp = await Company.findOne({ slug }).lean();
    if (!comp) return res.status(404).json({ error: 'Company not found' });
    res.json(comp);
  } catch (err) {
    console.error('Error fetching company:', err);
    res.status(500).json({ error: 'Failed to fetch company' });
  }
});

// Public: list papers for a company and year
router.get('/:slug/years/:year/papers', async (req, res) => {
  try {
    const { slug, year } = req.params;
    const comp = await Company.findOne({ slug }).lean();
    if (!comp) return res.status(404).json({ error: 'Company not found' });
    const papers = (comp.papers || []).filter(p => String(p.year) === String(year));
    res.json(papers);
  } catch (err) {
    console.error('Error fetching papers:', err);
    res.status(500).json({ error: 'Failed to fetch papers' });
  }
});

// download a paper PDF (serve buffer)
router.get('/:slug/papers/:paperId/download', async (req, res) => {
  try {
    const { slug, paperId } = req.params;
    const comp = await Company.findOne({ slug }).lean();
    if (!comp) return res.status(404).send('Company not found');

    const paper = (comp.papers || []).find(p => String(p._id) === String(paperId));
    if (!paper || !paper.file || !paper.file.data) return res.status(404).send('Paper not found');

    res.setHeader('Content-Type', paper.file.contentType || 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${paper.file.filename || 'paper.pdf'}"`);
    return res.send(Buffer.from(paper.file.data));
  } catch (err) {
    console.error('Failed to download paper', err);
    res.status(500).send('Failed to download');
  }
});

// ---------------------------
// Admin endpoints (manage companies and papers)
// ---------------------------
router.post('/admin', requireAdmin, async (req, res) => {
  try {
    const { name, slug, description, guidance } = req.body;
    const exists = await Company.findOne({ slug });
    if (exists) return res.status(400).json({ error: 'Company with this slug already exists' });
    const comp = await Company.create({ name, slug, description, guidance });
    res.status(201).json(comp);
  } catch (err) {
    console.error('Error creating company:', err);
    res.status(500).json({ error: 'Failed to create company' });
  }
});

router.put('/admin/:slug', requireAdmin, async (req, res) => {
  try {
    const { slug } = req.params;
    const update = req.body;
    const comp = await Company.findOneAndUpdate({ slug }, update, { new: true });
    if (!comp) return res.status(404).json({ error: 'Company not found' });
    res.json(comp);
  } catch (err) {
    console.error('Error updating company:', err);
    res.status(500).json({ error: 'Failed to update company' });
  }
});

router.delete('/admin/:slug', requireAdmin, async (req, res) => {
  try {
    const { slug } = req.params;
    const comp = await Company.findOneAndDelete({ slug });
    if (!comp) return res.status(404).json({ error: 'Company not found' });
    res.json({ message: 'Company deleted' });
  } catch (err) {
    console.error('Error deleting company:', err);
    res.status(500).json({ error: 'Failed to delete company' });
  }
});

// Admin: add paper to company (multipart/form-data: file,title,year)
router.post('/admin/:slug/papers', requireAdmin, upload.single('file'), async (req, res) => {
  try {
    const { slug } = req.params;
    const title = req.body.title || req.body.name || '';
    const year = Number(req.body.year || 0);
    const file = req.file;

    if (!title || !year || !file || !file.buffer) {
      return res.status(400).json({ error: 'title, year and file are required' });
    }

    const comp = await Company.findOne({ slug });
    if (!comp) return res.status(404).json({ error: 'Company not found' });

    const paper = {
      title,
      year,
      file: {
        data: file.buffer,
        contentType: file.mimetype,
        filename: file.originalname,
      },
      createdAt: new Date(),
    };

    comp.papers = comp.papers || [];
    comp.papers.push(paper);
    await comp.save();

    // return created paper meta (exclude buffer in response)
    const created = comp.papers[comp.papers.length - 1];
    res.status(201).json({
      ok: true,
      paper: { _id: created._id, title: created.title, year: created.year, filename: created.file?.filename, createdAt: created.createdAt }
    });
  } catch (err) {
    console.error('Failed to add company paper', err);
    res.status(500).json({ error: 'Failed to add paper', details: String(err && err.message ? err.message : err) });
  }
});

// ------------------ Admin: company-specific tests ------------------

// Create or update a company test
router.post('/admin/:slug/tests', requireAdmin, async (req, res) => {
  try {
    const { slug } = req.params;
    const { testId, title, sections } = req.body;
    if (!testId || !title || !Array.isArray(sections)) {
      return res.status(400).json({ error: 'testId, title and sections are required' });
    }
    const comp = await Company.findOne({ slug });
    if (!comp) return res.status(404).json({ error: 'Company not found' });

    // validate sections shape and referenced question IDs exist
    for (const s of sections) {
      if (!s.key || !['mcq','coding','essay'].includes(s.key)) {
        return res.status(400).json({ error: 'Invalid section key' });
      }
      if (Array.isArray(s.questionIds) && s.questionIds.length > 0) {
        const count = await QuizQuestion.countDocuments({ _id: { $in: s.questionIds } });
        if (count !== s.questionIds.length) {
          return res.status(400).json({ error: 'One or more questionIds invalid in section' });
        }
      }
    }

    // upsert test within company.tests (replace if testId exists)
    comp.tests = (comp.tests || []).filter(t => t.testId !== testId);
    comp.tests.push({ testId, title, sections });
    await comp.save();
    res.status(201).json({ ok: true, test: comp.tests.find(t => t.testId === testId) });
  } catch (err) {
    console.error('Error creating/updating company test:', err);
    res.status(500).json({ error: 'Failed to create/update test' });
  }
});

// Delete a company test
router.delete('/admin/:slug/tests/:testId', requireAdmin, async (req, res) => {
  try {
    const { slug, testId } = req.params;
    const comp = await Company.findOne({ slug });
    if (!comp) return res.status(404).json({ error: 'Company not found' });
    comp.tests = (comp.tests || []).filter(t => t.testId !== testId);
    await comp.save();
    res.json({ ok: true });
  } catch (err) {
    console.error('Error deleting company test:', err);
    res.status(500).json({ error: 'Failed to delete test' });
  }
});

// ------------------ Public: company tests consumption ------------------

// list tests for company (lightweight)
router.get('/:slug/tests', async (req, res) => {
  try {
    const { slug } = req.params;
    const comp = await Company.findOne({ slug }, { tests: 1, _id: 0 }).lean();
    if (!comp) return res.status(404).json({ error: 'Company not found' });
    const list = (comp.tests || []).map(t => ({ testId: t.testId, title: t.title, sections: t.sections.map(s => ({ key: s.key, title: s.title, count: (s.questionIds||[]).length })) }));
    res.json(list);
  } catch (err) {
    console.error('Error listing company tests:', err);
    res.status(500).json({ error: 'Failed to list tests' });
  }
});

// start a company test: snapshot questions from bank and return sanitized questions (no correctAnswer)
router.post('/:slug/tests/:testId/start', async (req, res) => {
  try {
    const { slug, testId } = req.params;
    const comp = await Company.findOne({ slug }).lean();
    if (!comp) return res.status(404).json({ error: 'Company not found' });
    const test = (comp.tests || []).find(t => t.testId === testId);
    if (!test) return res.status(404).json({ error: 'Test not found' });

    // fetch all referenced questions from bank, map by id for quick lookup
    const allIds = [];
    for (const s of test.sections) allIds.push(...(s.questionIds || []));
    const qDocs = await QuizQuestion.find({ _id: { $in: allIds } }).lean();
    const map = new Map(qDocs.map(q => [String(q._id), q]));

    // build sections with sanitized questions
    const sections = test.sections.map((s, si) => {
      const questions = (s.questionIds || []).map((qid, idx) => {
        const q = map.get(String(qid));
        if (!q) return null;
        return {
          qIndex: null, // will be filled per-section on client
          bankId: q._id,
          type: q.type === 'mcq' ? 'MCQ' : 'Descriptive',
          question: q.questionText,
          options: q.type === 'mcq' ? (q.options || []) : [],
          points: s.pointsPerQuestion || 1
        };
      }).filter(Boolean);
      return { key: s.key, title: s.title, questions };
    });

    // return test metadata + sanitized sections (no answers) — server does not persist attempt
    res.json({ testId: test.testId, title: test.title, sections });
  } catch (err) {
    console.error('Error starting company test:', err);
    res.status(500).json({ error: 'Failed to start test' });
  }
});

// submit company test responses: compute MCQ score only and return result (no persistence)
router.post('/:slug/tests/:testId/submit', async (req, res) => {
  try {
    const { slug, testId } = req.params;
    const { responses } = req.body; // expected { sectionKey: [{ bankId, value }] }
    if (!responses || typeof responses !== 'object') return res.status(400).json({ error: 'responses required' });

    const comp = await Company.findOne({ slug }).lean();
    if (!comp) return res.status(404).json({ error: 'Company not found' });
    const test = (comp.tests || []).find(t => t.testId === testId);
    if (!test) return res.status(404).json({ error: 'Test not found' });

    // Build map of Bank questions for referenced ids in submitted responses
    const submittedBankIds = [];
    for (const secKey of Object.keys(responses)) {
      const arr = Array.isArray(responses[secKey]) ? responses[secKey] : [];
      for (const r of arr) {
        if (r && r.bankId) submittedBankIds.push(r.bankId);
      }
    }
    const qDocs = await QuizQuestion.find({ _id: { $in: submittedBankIds } }).lean();
    const bankMap = new Map(qDocs.map(q => [String(q._id), q]));

    // Evaluate MCQ answers only
    let mcqCorrect = 0;
    let mcqTotal = 0;
    const details = {};

    for (const s of test.sections) {
      const secResponses = Array.isArray(responses[s.key]) ? responses[s.key] : [];
      const secDetail = [];
      for (const r of secResponses) {
        const q = bankMap.get(String(r.bankId));
        if (!q) {
          secDetail.push({ bankId: r.bankId, error: 'question not found' });
          continue;
        }
        if (s.key === 'mcq' && q.type === 'mcq') {
          mcqTotal += 1;
          // r.value is expected to be index (number) of selected option
          const correctIndex = Number(q.correctAnswer);
          const submitted = (typeof r.value === 'number') ? Number(r.value) : Number(r.value);
          const correct = !Number.isNaN(submitted) && submitted === correctIndex;
          if (correct) mcqCorrect += 1;
          secDetail.push({ bankId: q._id, correct, submitted, correctIndex, points: s.pointsPerQuestion || 1 });
        } else {
          // coding / essay / descriptive -> not auto-graded
          secDetail.push({ bankId: q._id, note: 'not auto-graded' });
        }
      }
      details[s.key] = secDetail;
    }

    // compute score (only MCQ counted)
    const score = mcqCorrect;
    const total = mcqTotal;

    res.json({ score, total, details });
  } catch (err) {
    console.error('Error submitting company test:', err);
    res.status(500).json({ error: 'Failed to submit test' });
  }
});

export default router;
