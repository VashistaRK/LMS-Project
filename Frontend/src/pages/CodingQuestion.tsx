/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";

interface CodingProps {
  question: any;
  savedValue: any;
  setAnswer: (value: any) => void;
  result: any;
}

const JUDGE0_URL = "https://sunadhedutech.com/judge0";

const LANGUAGE_MAP: any = {
  javascript: 63,
  python: 71,
  cpp: 54,
  java: 62,
};

export default function CodingQuestion({
  question,
  savedValue,
  setAnswer,
  result,
}: CodingProps) {
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(savedValue?.code || "");
  const [input, setInput] = useState(savedValue?.input || "");
  const [runResult, setRunResult] = useState<any>(null);
  const [running, setRunning] = useState(false);

  const languageId = LANGUAGE_MAP[language];

  // ----------------------------------------------------------------------
  // ⭐ RUN CODE — your desired structure using useCallback
  // ----------------------------------------------------------------------
  const runCode = useCallback(async () => {
    if (!question) return;

    setRunning(true);
    setRunResult(null);

    try {
      const payload = {
        source_code: code,
        language_id: languageId,
        stdin: input || "",
        expected_output: question.expectedOutput ?? null,
      };

      const url =
        `${JUDGE0_URL}/submissions?` +
        `base64_encoded=false&wait=true&fields=` +
        `stdout,stderr,status,compile_output,expected_output,time,memory`;

      const res = await axios.post(url, payload, {
        headers: { "Content-Type": "application/json" },
      });

      const result = res.data;
      console.log("Run result:", result);

      // -------------------------------
      // ⭐ Compare expected output (if exists)
      // -------------------------------
      if (question.expectedOutput != null) {
        const clean = (x: string) => x?.trim();
        result.passed =
          clean(result.stdout) === clean(question.expectedOutput || "");
      }

      setRunResult(result);
    } catch (err) {
      console.error(err);
      setRunResult({ error: "Execution failed", details: err });
    } finally {
      setRunning(false);
    }
  }, [code, input, languageId, question]);

  // ----------------------------------------------------------------------
  // SAVE ANSWER TO PARENT
  // ----------------------------------------------------------------------
  const saveAnswer = () => {
    setAnswer({
      code,
      input,
      language,
      lastRun: runResult || null,
    });
  };

  // ----------------------------------------------------------------------
  // RENDER UI
  // ----------------------------------------------------------------------
  return (
    <div className="space-y-5">
      {/* Language Selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-semibold text-gray-700">
          Language:
        </label>

        <select
          value={language}
          disabled={!!result}
          onChange={(e) => setLanguage(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded-lg"
        >
          <option value="javascript">JavaScript (Node)</option>
          <option value="python">Python</option>
          <option value="cpp">C++</option>
          <option value="java">Java</option>
        </select>
      </div>

      {/* Monaco Editor */}
      <Editor
        height="350px"
        theme="vs-dark"
        language={language}
        value={code}
        onChange={(v) => setCode(v || "")}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          readOnly: !!result,
        }}
      />

      {/* Custom Input */}
      <div>
        <label className="text-sm font-semibold text-gray-700">
          Input (optional):
        </label>
        <textarea
          value={input}
          disabled={!!result}
          onChange={(e) => setInput(e.target.value)}
          rows={4}
          className="w-full border border-gray-300 rounded-lg p-3 mt-2"
          placeholder="Custom input..."
        />
      </div>

      {/* Buttons */}
      {!result && (
        <div className="flex gap-4">
          <button
            onClick={runCode}
            disabled={running}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            {running ? "Running..." : "Run Code"}
          </button>

          <button
            onClick={saveAnswer}
            className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
          >
            Save Answer
          </button>
        </div>
      )}

      {/* Output Panel */}
      <div className="bg-gray-900 text-white p-4 rounded-lg min-h-[140px]">
        <div className="font-semibold mb-2 text-gray-300">Output:</div>

        {runResult ? (
          <pre className="whitespace-pre-wrap text-sm">
            {runResult.stdout ||
              runResult.stderr ||
              runResult.compile_output ||
              runResult.error ||
              "No output"}
          </pre>
        ) : (
          <pre className="text-sm opacity-50">Run code to see output</pre>
        )}

        {/* Expected output pass/fail indicator */}
        {runResult?.passed !== undefined && (
          <div
            className={`mt-3 p-2 rounded text-sm ${
              runResult.passed
                ? "bg-green-700 text-white"
                : "bg-red-700 text-white"
            }`}
          >
            {runResult.passed ? "✔ Passed" : "✘ Failed"}
          </div>
        )}
      </div>

      {/* After submission */}
      {result && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          ⚠ Coding question submitted. Code locked for evaluation.
        </div>
      )}
    </div>
  );
}
