import { VM } from "vm2";
import CodingQuestion from "../models/codingQuestion.js";

// 🧠 Helper: Evaluate submitted code safely
function evaluateCode(code, question) {
  const results = [];

  try {
    const vm = new VM({ timeout: 1000, sandbox: {} });

    // Run the user code
    vm.run(code);

    // Extract the function
    const fn = vm.run(`typeof ${question.functionName} !== 'undefined' ? ${question.functionName} : null`);

    if (typeof fn !== "function") {
      throw new Error(`Function "${question.functionName}" not defined`);
    }

    // Run all test cases
    for (const testCase of question.testCases) {
      let output;
      let pass = false;

      try {
        output = fn(...testCase.input);
        pass = JSON.stringify(output) === JSON.stringify(testCase.output);
      } catch (err) {
        output = `Error: ${err.message}`;
      }

      results.push({
        input: testCase.input,
        expected: testCase.output,
        output,
        pass,
      });
    }
  } catch (err) {
    return [{ error: `Execution failed: ${err.message}` }];
  }

  return results;
}

// 📘 Get all coding questions (with optional filters)
export const getAllQuestions = async (req, res) => {
  try {
    const { difficulty, tag } = req.query;
    const filter = {};

    if (difficulty) filter.difficulty = difficulty;
    if (tag) filter.tags = { $in: [tag] };

    const questions = await CodingQuestion.find(filter).select("_id title difficulty tags");
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🎯 Get a random coding question
export const getRandomQuestion = async (req, res) => {
  try {
    const count = await CodingQuestion.countDocuments();
    const random = Math.floor(Math.random() * count);
    const question = await CodingQuestion.findOne().skip(random);
    res.json(question);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔍 Get question by ID
export const getQuestionById = async (req, res) => {
  try {
    const question = await CodingQuestion.findById(req.params.id);
    if (!question) return res.status(404).json({ error: "Question not found" });
    res.json(question);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✍️ Create new question
export const createQuestion = async (req, res) => {
  try {
    const question = new CodingQuestion(req.body);
    await question.save();
    res.status(201).json({ success: true, question });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// 🧾 Update existing question
export const updateQuestion = async (req, res) => {
  try {
    const updated = await CodingQuestion.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json({ success: true, question: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// 💡 Submit code solution for evaluation
export const submitSolution = async (req, res) => {
  try {
    const { code, questionId } = req.body;

    const question = await CodingQuestion.findById(questionId);
    if (!question) return res.status(404).json({ error: "Question not found" });

    const results = evaluateCode(code, question);
    const passedAll = results.every((r) => r.pass);

    res.json({ results, passedAll });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
