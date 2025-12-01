import axios from "axios";
import { Router } from "express";

const router = Router();

// If using RapidAPI Judge0:
const JUDGE0_URL = "https://judge0-ce.p.rapidapi.com/submissions";
const RAPID_KEY = process.env.RAPIDAPI_KEY;

// POST /api/judge0/run
router.post("/run", async (req, res) => {
  try {
    const {
      source_code,
      language_id,
      stdin = "",
      expected_output = null,
      wait = true,
    } = req.body;

    if (!source_code || !language_id) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const submissionPayload = {
      source_code,
      language_id,
      stdin,
      expected_output,
      redirect_stderr_to_stdout: false,
    };

    // 1️⃣ Create submission
    const submission = await axios.post(JUDGE0_URL, submissionPayload, {
      params: { base64_encoded: false, wait: false },
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": RAPID_KEY,
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
      },
    });

    const token = submission.data.token;
    if (!token) {
      return res.status(500).json({ error: "No token received from Judge0" });
    }

    // 2️⃣ Poll until execution completes
    let result = null;
    let statusId = 1;

    while (statusId <= 2) {
      const poll = await axios.get(`${JUDGE0_URL}/${token}`, {
        params: { base64_encoded: false },
        headers: {
          "X-RapidAPI-Key": RAPID_KEY,
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        },
      });

      result = poll.data;
      statusId = result.status?.id;

      if (statusId <= 2) {
        await new Promise((resolve) => setTimeout(resolve, 800)); // wait 0.8 sec
      }
    }

    // 3️⃣ Add pass/fail comparison
    if (expected_output != null) {
      const cleanExpected = expected_output.trim();
      const cleanOutput = (result.stdout || "").trim();

      result.passed = cleanExpected === cleanOutput;
    }

    res.json(result);
  } catch (err) {
    console.error("Judge0 ERROR:", err.response?.data || err);
    res.status(500).json({
      error: "Judge0 execution failed",
      details: err.response?.data || err,
    });
  }
});

export default router;
