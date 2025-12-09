/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useEffect } from "react";
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
  const [runResult, setRunResult] = useState<any>(null);
  const [running, setRunning] = useState(false);

  const languageId = LANGUAGE_MAP[language];

  const getTemplate = (lang: string) => {
    switch (lang) {
      case "python":
        return `# write your code here\n`;
      case "javascript":
        return `function solve() {\n  // write your code here\n}\n`;
      case "cpp":
        return `#include <bits/stdc++.h>\nusing namespace std;\nint main(){\n    // write your code here\n}\n`;
      case "java":
        return `public class Main {\n  public static void main(String[] args){\n    // write your code here\n  }\n}`;
      default:
        return "";
    }
  };

  useEffect(() => {
    // Do not inject question-provided starter code. Only populate a small
    // language-specific template when there is no saved code for this user.
    if (!savedValue?.code) {
      setCode(getTemplate(language));
    }
  }, [language]);

  // ----------------------------------------------------------------------
  // ⭐ RUN CODE WITH MULTIPLE TESTCASES
  // ----------------------------------------------------------------------
  const runCode = useCallback(async () => {
    if (!question || !question?.testCases) return;

    setRunning(true);
    setRunResult(null);

    const results: any[] = [];
    let allPassed = true;

    for (const tc of question.testCases) {
      const inputStr = Array.isArray(tc.input) ? tc.input.join("\n") : tc.input;
      const expectedStr = tc.output;

      const payload = {
        language_id: languageId,
        stdin: inputStr,
        expected_output: expectedStr,
      };

      const url =
        `${JUDGE0_URL}/submissions?` +
        `base64_encoded=false&wait=true&fields=` +
        `stdout,stderr,status,compile_output,expected_output,time,memory`;

      try {
        const res = await axios.post(url, payload, {
          headers: { "Content-Type": "application/json" },
        });

        const data = res.data;

        const clean = (x: string) => x?.trim();
        const passed = clean(data.stdout) === clean(expectedStr);

        results.push({
          input: inputStr,
          expected: expectedStr,
          output: data.stdout,
          error: data.stderr || data.compile_output,
          passed,
        });

        if (!passed) allPassed = false;
      } catch (err) {
        results.push({
          input: tc.input,
          expected: tc.output,
          error: "Execution error",
          passed: false,
        });
        allPassed = false;
      }
    }

    setRunResult({ allPassed, results });
    setRunning(false);
  }, [code, languageId, question]);

  // ----------------------------------------------------------------------
  // SAVE ANSWER (FOR SUBMISSION)
  // ----------------------------------------------------------------------
  const saveAnswer = () => {
    setAnswer({
      code,
      language,
      testResults: runResult,
      bankId: question?.bankId,
    });
  };

  // ----------------------------------------------------------------------
  // UI
  // ----------------------------------------------------------------------

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Left: Question */}
      <div className="col-span-5 bg-white p-5 rounded-lg border">
        <h2 className="text-xl font-bold mb-2">{question?.title}</h2>

        <div className="text-sm whitespace-pre-line mb-4">
          {question?.description}
        </div>

        {/* EXAMPLES */}
        {question?.examples?.length > 0 && (
          <div className="mb-3">
            <h3 className="font-semibold">Examples</h3>
            <ul className="list-disc ml-5 mt-2">
              {question.examples.map((ex: any, idx: number) => (
                <li key={idx} className="font-mono">{ex}</li>
              ))}
            </ul>
          </div>
        )}

        {/* TESTCASES */}
        {question?.testCases?.length > 0 && (
          <div className="mb-3">
            <h3 className="font-semibold">Sample Testcase</h3>
            <div className="p-3 bg-gray-100 rounded mt-2 text-sm">
              <div><strong>Input:</strong> {JSON.stringify(question.testCases[0].input)}</div>
              <div><strong>Output:</strong> {question.testCases[0].output}</div>
            </div>
          </div>
        )}

        {/* CONSTRAINTS */}
        {question?.constraints && (
          <div className="mb-3">
            <h3 className="font-semibold">Constraints</h3>
            <pre className="text-sm mt-2">{question.constraints}</pre>
          </div>
        )}
      </div>

      {/* Right: Editor */}
      <div className="col-span-7 space-y-4">
        {/* LANGUAGE SELECT + BUTTONS */}
        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            <label className="text-sm font-semibold">Language:</label>
            <select
              disabled={!!result}
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="border px-3 py-2 rounded"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={saveAnswer}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Save
            </button>
            <button
              onClick={runCode}
              disabled={running}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              {running ? "Running..." : "Run"}
            </button>
          </div>
        </div>

        {/* EDITOR */}
        <div className="h-[420px] border rounded">
          <Editor
            height="100%"
            theme="vs-dark"
            language={language}
            value={code}
            onChange={(v) => setCode(v || "")}
            options={{ fontSize: 14, minimap: { enabled: false } }}
          />
        </div>

        {/* OUTPUT */}
        <div className="bg-gray-900 text-white p-4 rounded min-h-[150px]">
          <div className="text-gray-300 font-semibold">Output:</div>

          {!runResult && <div className="text-gray-400 mt-2">Run code to see results</div>}

          {runResult && (
            <div className="mt-3 space-y-3">
              {runResult.results.map((r: any, i: number) => (
                <div key={i} className="p-3 rounded bg-gray-800">
                  <div><strong>Input:</strong> {r.input}</div>
                  <div><strong>Expected:</strong> {r.expected}</div>
                  <div><strong>Output:</strong> {r.output || r.error}</div>

                  <div className={`mt-2 p-2 rounded ${r.passed ? "bg-green-700" : "bg-red-700"}`}>
                    {r.passed ? "✔ Passed" : "✘ Failed"}
                  </div>
                </div>
              ))}

              <div className={`p-3 rounded text-center text-lg font-bold ${
                runResult.allPassed ? "bg-green-700" : "bg-red-700"
              }`}>
                {runResult.allPassed ? "ALL TESTS PASSED" : "SOME TESTS FAILED"}
              </div>
            </div>
          )}
        </div>

        {/* CODE LOCK AFTER SUBMISSION */}
        {result && (
          <div className="p-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded">
            Submission already completed — editor locked.
          </div>
        )}
      </div>
    </div>
  );
}
