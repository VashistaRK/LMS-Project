/* eslint-disable */
import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { startAttempt } from "@/services/assessmentApi";
import axios from "axios";
import Editor from "@monaco-editor/react";

type QuestionSnapshot = {
  qIndex: number;
  type: string;
  question: string;
  options?: any[];
  answer?: any;
  points?: number;
  starterCode?: string;
  input?: string;
  expectedOutput?: string;
  title?: string;
  description?: string;
};

export default function TechCodingTestPage() {
  const { id, testId } = useParams<{ id: string; testId: string }>();

  const [, setAttemptId] = useState<string | null>(null);
  const [codingQs, setCodingQs] = useState<QuestionSnapshot[]>([]);
  const [active, setActive] = useState(0);
  const [code, setCode] = useState("");
  const [languageId, setLanguageId] = useState<number>(62); // Default Java
  const [runResult, setRunResult] = useState<any>(null);
  const [running, setRunning] = useState(false);
  const [savedCodes, setSavedCodes] = useState<Record<number, string>>({});

  // Judge0 Base URL (YOUR INSTANCE)
  const JUDGE0_URL = "https://sunadhedutech.com/judge0";

  // Load attempt + questions
  useEffect(() => {
    async function init() {
      try {
        await document.documentElement.requestFullscreen?.();
      } catch (_) {}

      try {
        const data = await startAttempt(id!, testId!);
        setAttemptId(data.attemptId || null);

        const coding = (data.questions || []).filter(
          (q: any) => q.type?.includes("Coding")
        );

        const normalized = coding.map((q: any, idx: number) => ({
          qIndex: q.qIndex ?? idx,
          type: q.type,
          question: q.question || q.title,
          starterCode: q.starterCode || q.starter || "",
          input: q.input || "",
          expectedOutput: q.expectedOutput ?? q.output ?? null,
          title: q.title,
          description: q.description || "",
        }));

        setCodingQs(normalized);

        if (normalized.length > 0) {
          setActive(0);
          setCode(normalized[0].starterCode || "");
        }
      } catch (err) {
        console.error("Attempt load error:", err);
      }
    }
    init();
  }, [id, testId]);

  // Switch coding question
  const openQuestion = (i: number) => {
    setSavedCodes((prev) => ({ ...prev, [active]: code }));
    setActive(i);
    setCode(savedCodes[i] ?? codingQs[i]?.starterCode ?? "");
    setRunResult(null);
  };

  // Main runCode using JUDGE0
  const runCode = useCallback(async () => {
    if (!codingQs[active]) return;

    setRunning(true);
    setRunResult(null);

    try {
      const payload = {
        source_code: code,
        language_id: languageId,
        stdin: codingQs[active].input || "",
        expected_output: codingQs[active].expectedOutput ?? null,
      };

      // Judge0 run API
      const url = `${JUDGE0_URL}/submissions?base64_encoded=false&fields=stdout,stderr,status,compile_output,expected_output,time,memory&wait=true`;

      const r = await axios.post(url, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = r.data;
      console.log("Run result:", result);

      // Compare expected output
      if (codingQs[active].expectedOutput != null) {
        const clean = (x: string) => x?.trim();
        result.passed =
          clean(result.stdout) ===
          clean(codingQs[active].expectedOutput || "");
      }

      setRunResult(result);
    } catch (err) {
      console.error(err);
      setRunResult({ error: "Execution failed", details: err });
    } finally {
      setRunning(false);
    }
  }, [code, languageId, active, codingQs]);

  if (!codingQs.length) {
    return (
      <div className="p-8 text-center">
        No coding questions found for this test.
      </div>
    );
  }

  const q = codingQs[active];

  return (
    <div className="h-screen flex flex-col">
      {/* Top nav (question buttons + actions) */}
      <div className="flex gap-2 p-3 bg-slate-50 border-b overflow-x-auto">
        {codingQs.map((_, idx) => (
          <button
            key={idx}
            onClick={() => openQuestion(idx)}
            className={`px-3 py-2 rounded-md border ${
              idx === active ? "bg-blue-600 text-white" : "bg-white"
            }`}
          >
            Q{idx + 1}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-2">
          <select
            value={languageId}
            onChange={(e) => setLanguageId(Number(e.target.value))}
            className="border rounded px-2 py-1"
          >
            <option value={62}>Java</option>
            <option value={71}>Python</option>
            <option value={54}>C++</option>
            <option value={50}>C</option>
            <option value={63}>JavaScript</option>
          </select>

          <button
            onClick={runCode}
            disabled={running}
            className="bg-green-600 text-white px-3 py-1 rounded"
          >
            {running ? "Running..." : "Run"}
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {/* Question Panel */}
        <div className="border rounded p-4 overflow-y-auto">
          <h2 className="text-xl font-bold mb-2">
            {q.title || `Question ${active + 1}`}
          </h2>
          <div className="prose whitespace-pre-wrap mb-4">
            {q.question || q.description}
          </div>

          <h4 className="font-semibold">Input</h4>
          <pre className="bg-gray-100 p-2 rounded">
            {q.input || "<no input>"}
          </pre>

          <h4 className="mt-3 font-semibold">Expected Output</h4>
          <pre className="bg-gray-100 p-2 rounded">
            {q.expectedOutput ?? "<none>"}
          </pre>
        </div>

        {/* Editor + Result */}
        <div className="flex flex-col border rounded overflow-hidden">
          <div className="p-3 border-b">
            <div className="text-sm text-gray-600">
              Language:{" "}
              <strong>
                {languageId === 71
                  ? "Python"
                  : languageId === 62
                  ? "Java"
                  : languageId === 54
                  ? "C++"
                  : languageId === 50
                  ? "C"
                  : "JavaScript"}
              </strong>
            </div>
          </div>

          <div className="flex-1">
            <Editor
              height="100%"
              value={code}
              theme="vs-dark"
              language={
                languageId === 71
                  ? "python"
                  : languageId === 62
                  ? "java"
                  : languageId === 54
                  ? "cpp"
                  : languageId === 50
                  ? "c"
                  : "javascript"
              }
              onChange={(v) => setCode(v || "")}
            />
          </div>

          {/* OUTPUT */}
          <div className="p-3 border-t bg-gray-50 overflow-y-auto">
            <div className="flex justify-between mb-2">
              <div className="text-sm font-medium">Run Result</div>
            </div>

            {runResult ? (
              <>
                <div className="mb-2">
                  <strong>Status:</strong>{" "}
                  {runResult.status?.description ||
                    runResult.status?.message ||
                    JSON.stringify(runResult.status)}
                </div>

                {runResult.stdout && (
                  <pre className="bg-white p-2 rounded">
                    {runResult.stdout}
                  </pre>
                )}

                {runResult.stderr && (
                  <pre className="bg-white p-2 rounded text-red-500">
                    {runResult.stderr}
                  </pre>
                )}

                {runResult.compile_output && (
                  <pre className="bg-white p-2 rounded text-orange-500">
                    {runResult.compile_output}
                  </pre>
                )}

                {q.expectedOutput != null && (
                  <div
                    className={`mt-2 px-3 py-2 rounded ${
                      runResult.passed
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {runResult.passed
                      ? "Test Case Passed"
                      : "Test Case Failed"}
                  </div>
                )}
              </>
            ) : (
              <div className="text-gray-500">Run code to see output.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
