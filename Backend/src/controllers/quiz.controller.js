import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import mammoth from "mammoth";
import QuizQuestion from "../models/quizQuestion.js";
import OpenAI from "openai";
import Quiz from "../models/quiz.model.js";
import Course from "../models/Course.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

//
export const uploadDocumentQuiz = async (req, res) => {
  const filePath = path.join(process.cwd(), "uploads", req.file.filename);
  console.log("uploadDocumentQuiz called. filePath=", filePath, "originalName=", req.file?.originalname);

  try {
    let text = "";

    if (!filePath || !fs.existsSync(filePath)) {
      console.error("Uploaded file not found at", filePath);
      return res.status(500).json({ error: "Uploaded file not found on server" });
    }

    // Ensure we can read the file
    try {
      fs.accessSync(filePath, fs.constants.R_OK);
    } catch (accessErr) {
      console.error("Cannot read uploaded file:", accessErr);
      return res.status(500).json({ error: "Cannot read uploaded file" });
    }

    if (req.file.mimetype === "application/pdf") {
      let buf;
      try {
        buf = fs.readFileSync(filePath);
      } catch (readErr) {
        console.error("Error reading uploaded PDF:", readErr);
        return res.status(500).json({ error: "Failed to read uploaded PDF" });
      }
      const parsed = await pdfParse(buf);
      text = parsed.text;
    } else if (
      req.file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      try {
        const result = await mammoth.extractRawText({ path: filePath });
        text = result.value;
      } catch (mErr) {
        console.error("Error parsing docx with mammoth:", mErr);
        return res.status(500).json({ error: "Failed to parse uploaded docx" });
      }
    } else {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    // ask GPT
    const prompt = `
      Generate all MCQ questions based on this content:

      "${text}"

      Return JSON ONLY:
      [
        {
          "title":"...",
          "options":[0,1,2,3],
          "correctAnswer":1
        }
      ]
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    let raw = completion.choices[0].message.content.trim();
    if (raw.startsWith("```")) raw = raw.replace(/```json|```/g, "").trim();

    const quizArray = JSON.parse(raw);

    // save questions
    const mappedQuestions = quizArray.map((q) => {
      let answerIndex = 0;

      if (typeof q.correctAnswer === "number") {
        // GPT returned 0/1/2/3
        answerIndex = q.correctAnswer;
      } else if (typeof q.correctAnswer === "string") {
        // GPT returned "A" / "B" / ...
        const letter = q.correctAnswer.trim();
        answerIndex = "ABCD".indexOf(letter.toUpperCase());
        if (answerIndex === -1) answerIndex = 0; // fallback
      }

      return {
        type: "mcq",
        questionText: q.title,
        options: q.options,
        correctAnswer: answerIndex,
        genre: "generated",
      };
    });

    const savedQuestions = await QuizQuestion.insertMany(mappedQuestions);

    // create quiz doc (store IDs only)
    const quizDoc = await Quiz.create({
      title: req.body.title || "Uploaded Quiz",
      questions: savedQuestions.map((q) => q._id),
    });

    // UPDATE COURSE → set quizId
    const { courseId, sectionId, chapterId } = req.params;

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
          [`sections.${sectionId}.chapters.${chapterId}.quizId`]: quizDoc._id,
        },
      }
    );

  fs.unlink(filePath, (uErr) => { if (uErr) console.warn("Failed to unlink uploaded file:", uErr); });
    return res.status(201).json({
      success: true,
      quizId: quizDoc._id,
      questionCount: savedQuestions.length,
    });
  } catch (err) {
    console.error("uploadDocumentQuiz error:", err);
    try {
      fs.unlink(filePath, (uErr) => { if (uErr) console.warn("Failed to unlink after error:", uErr); });
    } catch (ignored) {}
    res.status(500).json({ error: "Failed to process document", details: String(err?.message || err) });
  }
};

export const uploadDocumentQuestions = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = path.join(process.cwd(), "uploads", req.file.filename);

    if (!fs.existsSync(filePath)) {
      return res.status(400).json({ error: "File upload failed" });
    }

    // -----------------------
    // Extract text
    // -----------------------
    let text = "";

    try {
      if (req.file.mimetype === "application/pdf") {
        const buffer = fs.readFileSync(filePath);
        const parsed = await pdfParse(buffer);
        text = parsed.text;
      } else if (
        req.file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        const result = await mammoth.extractRawText({ path: filePath });
        text = result.value;
      } else {
        return res.status(400).json({ error: "Unsupported file type" });
      }
    } catch (err) {
      console.error("TEXT EXTRACTION ERROR:", err);
      return res.status(500).json({ error: "Failed to extract text" });
    }

    if (!text.trim()) {
      return res.status(400).json({ error: "Document has no text" });
    }

    // -----------------------
    // GPT Prompt
    // -----------------------
    const prompt = `
Extract exactly all MCQs from the following text.

Return ONLY JSON. No Markdown. No explanation.

Format:
[
  {
    "title": "Question text",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": "A",
    "genre": "imported"
  }
]

TEXT:
${text}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 800,
    });

    let raw = completion.choices[0].message.content.trim();

    // Remove backticks / code fences
    raw = raw.replace(/```json/g, "").replace(/```/g, "").trim();

    // -----------------------
    // Extract pure JSON using regex
    // -----------------------
    const jsonMatch = raw.match(/\[([\s\S]*)\]/);

    if (!jsonMatch) {
      console.error("GPT RAW OUTPUT:", raw);
      return res.status(500).json({
        error: "GPT did not return valid JSON",
        raw,
      });
    }

    const cleanJson = jsonMatch[0];

    let quizArray = [];

    try {
      quizArray = JSON.parse(cleanJson);
    } catch (err) {
      console.error("JSON PARSE ERROR:", err, cleanJson);
      return res.status(500).json({
        error: "Failed to parse JSON",
        raw: cleanJson,
      });
    }

    // -----------------------
    // Format questions for DB
    // -----------------------
    const formatted = quizArray.map((q) => ({
      type: "mcq",
      questionText: q.title || "",
      options: q.options || [],
      correctAnswer: "ABCD".indexOf((q.correctAnswer || "A").toUpperCase()),
      genre: q.genre || "imported",
    }));

    const saved = await QuizQuestion.insertMany(formatted);

    fs.unlink(filePath, () => {});

    return res.status(201).json({
      success: true,
      added: saved.length,
      questions: saved,
    });

  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    return res.status(500).json({ error: "Failed to process", details: err.message });
  }
};

// 🧩 Generate quiz questions from content
export const generateQuiz = async (req, res) => {
  try {
    const { chapterTitle, courseContent } = req.body;

    if (!chapterTitle || !courseContent) {
      return res
        .status(400)
        .json({ error: "Missing chapterTitle or courseContent" });
    }

    const prompt = `
      Generate all MCQ questions for the chapter "${chapterTitle}" based on:
      "${courseContent}".

      Format as a JSON array:
      [
        {
          "title": "Question text",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": "B"
        }
      ]
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
    });

    let raw = completion.choices[0].message.content.trim();
    if (raw.startsWith("```")) raw = raw.replace(/```json|```/g, "").trim();

    const quizArray = JSON.parse(raw);

    // Normalize and validate quiz items
    const toSave = quizArray.map((q) => {
      let answerIndex = 0;
      if (typeof q.correctAnswer === "number") {
        answerIndex = q.correctAnswer;
      } else if (typeof q.correctAnswer === "string") {
        const letter = q.correctAnswer.trim().toUpperCase();
        const idx = "ABCD".indexOf(letter[0]);
        answerIndex = idx === -1 ? 0 : idx;
      }

      return {
        type: "mcq",
        questionText: q.title || q.question || "",
        options: Array.isArray(q.options) ? q.options : [],
        correctAnswer: answerIndex,
        chapterTitle,
        genre: q.genre || "generated",
      };
    });

    // Save each MCQ as a separate document
    const savedQuestions = await QuizQuestion.insertMany(toSave);

    // format response for frontend expectations
    const questions = savedQuestions.map((q) => {
      const idx = typeof q.correctAnswer === 'number' ? q.correctAnswer : 0;
      const letter = String.fromCharCode(65 + (idx || 0));
      return {
        id: q._id,
        question: q.questionText,
        options: q.options,
        correctAnswerText: (q.options && q.options[idx]) || null,
        correctAnswerLetter: letter,
      };
    });

    res.status(201).json({ success: true, questions });
  } catch (err) {
    console.error("Quiz generation error:", err);
    res.status(500).json({ error: "Failed to generate quiz", details: String(err.message || err) });
  }
};

// 🧩 Get all quiz questions (filterable)
export const getAllQuestions = async (req, res) => {
  try {
    const { chapterTitle, courseId, genre } = req.query;
    const filter = {};

    if (chapterTitle) filter.chapterTitle = chapterTitle;
    if (courseId) filter.courseId = courseId;
    if (genre) filter.genre = genre;

    // include options and correctAnswer in the projection to avoid undefined
    const quizzes = await QuizQuestion.find(filter, "_id type questionText genre options correctAnswer");
    const formatted = quizzes.map((q) => ({
      id: q._id,
      question: q.questionText,
      genre:q.genre,
      options: q.options || [],
      answer: (Array.isArray(q.options) && typeof q.correctAnswer === 'number') ? q.options[q.correctAnswer] : null,
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// new: list distinct genres
export const getGenres = async (req, res) => {
  try {
    const genres = await QuizQuestion.distinct("genre");
    res.json(genres);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🧩 Get a single quiz question
export const getQuestionById = async (req, res) => {
  try {
    const quiz = await QuizQuestion.findById(req.params.id);
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🧩 Create manually
export const createQuestion = async (req, res) => {
  try {
    const quiz = new QuizQuestion(req.body);
    await quiz.save();
    res.status(201).json(quiz);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// 🧩 Update quiz
export const updateQuestion = async (req, res) => {
  try {
    const updated = await QuizQuestion.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// 🧩 Delete quiz
export const deleteQuestion = async (req, res) => {
  try {
    const deleted = await QuizQuestion.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET QUIZ + questions
export const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });

    const questions = await QuizQuestion.find({ _id: { $in: quiz.questions } });

    // frontend expects this shape:
    const formatted = questions.map((q) => ({
      id: q._id,
      question: q.questionText,
      options: q.options,
      answer: q.options[q.correctAnswer],
    }));

    res.json(formatted);
  } catch (err) {
    console.error("get quiz error:", err);
    res.status(500).json({ error: "Failed to load quiz" });
  }
};
