/* eslint-disable */
import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { startAttempt } from "@/services/assessmentApi"; // your existing service
import axios from "axios";
// If using Monaco:
import Editor from "@monaco-editor/react";

type QuestionSnapshot = {
  qIndex: number;
  type: string; // 'Coding' or 'MCQ'
  question: string;
  options?: any[];
  answer?: any;
  points?: number;
  // optional extras
  starterCode?: string;
  input?: string;
  expectedOutput?: string;
  title?: string;
  description?: string;
};

export default function TechCodingTestPage() {
  const { id, testId } = useParams<{ id: string; testId: string }>();

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [, setQuestions] = useState<QuestionSnapshot[]>([]);
  const [codingQs, setCodingQs] = useState<QuestionSnapshot[]>([]);
  const [active, setActive] = useState(0);
  const [code, setCode] = useState("");
  const [languageId, setLanguageId] = useState<number>(62); // default: Java 62. Change as needed
  const [runResult, setRunResult] = useState<any>(null);
  const [running, setRunning] = useState(false);
  const [savedCodes, setSavedCodes] = useState<Record<number, string>>({});

  // fetch attempt & questions
  useEffect(() => {
    async function init() {
      try {
        const data = await startAttempt(id!, testId!); // uses your frontend service
        // Data format from your backend: { attemptId, durationSec, title, questions: [...] }
        console.log("Started attempt data:", data);
        setAttemptId(data.attemptId || null);
        const qlist: QuestionSnapshot[] = Array.isArray(data.questions)
          ? data.questions
          : [];
        setQuestions(qlist);

        // Filter coding questions only
        const coding = qlist.filter((q) => q.type && q.type.includes("Coding"));
        // Allow fallback: if snapshot objects have extra fields, adapt:
        const codingNormalized = coding.map((q, idx) => ({
          qIndex: q.qIndex ?? idx,
          type: q.type,
          question: (q as any).question || (q as any).title,
          starterCode: (q as any).starterCode || (q as any).starter || "",
          input: (q as any).input || "",
          expectedOutput:
            (q as any).expectedOutput ?? (q as any).output ?? null,
          title: (q as any).title,
          description: (q as any).description || "",
        }));
        setCodingQs(codingNormalized);

        // load first code
        if (codingNormalized.length > 0) {
          setActive(0);
          setCode(codingNormalized[0].starterCode || "");
        } else {
          // nothing to show
        }
      } catch (err) {
        console.error("Failed to start attempt", err);
      }
    }
    init();
  }, [id, testId]);

  // when switching question, persist previous code and load stored code
  const openQuestion = (i: number) => {
    setSavedCodes((prev) => ({ ...prev, [active]: code }));
    setActive(i);
    setCode(savedCodes[i] ?? codingQs[i]?.starterCode ?? "");
    setRunResult(null);
  };

  const runCode = useCallback(async () => {
    if (!codingQs[active]) return;
    setRunning(true);
    setRunResult(null);

    try {
      const Base_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

      const payload = {
        source_code: code,
        language_id: languageId,
        stdin: codingQs[active].input || "",
        expected_output: codingQs[active].expectedOutput ?? null,
        wait: true,
      };

      const r = await axios.post(`${Base_URL}/api/judge0/run`, payload);
      setRunResult(r.data);
    } catch (err) {
      console.error(err);
      setRunResult({ error: err || "Execution error" });
    } finally {
      setRunning(false);
    }
  }, [code, languageId, active, codingQs]);

  const submitAll = async () => {
    // Optional: Save per-question code to backend or submit attempt results.
    // For now, just show a summary pass/fail from runResult stored per-question.
    // Implement per your scoring flow.
    alert(
      "Submit flow: implement according to your scoring/attempt-saving rules."
    );
  };

  if (!codingQs || codingQs.length === 0) {
    return (
      <div className="p-8 text-center">
        No coding questions found for this test.
      </div>
    );
  }

  const q = codingQs[active];

  return (
    <div className="h-screen flex flex-col">
      {/* top nav: question buttons */}
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
        <div className="ml-auto flex items-center gap-2 px-2">
          <select
            value={languageId}
            onChange={(e) => setLanguageId(Number(e.target.value))}
            className="border rounded px-2 py-1"
          >
            {/* Add languages you support and their Judge0 language_id */}
            <option value={62}>Java (62)</option>
            <option value={71}>Python (71)</option>
            <option value={54}>C++ (54)</option>
            <option value={50}>C (50)</option>
            <option value={63}>JavaScript (63)</option>
          </select>
          <button
            onClick={runCode}
            disabled={running}
            className="bg-green-600 text-white px-3 py-1 rounded"
          >
            {running ? "Running..." : "Run"}
          </button>
          <button
            onClick={submitAll}
            className="ml-2 bg-indigo-600 text-white px-3 py-1 rounded"
          >
            Submit
          </button>
        </div>
      </div>

      {/* main */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 overflow-hidden">
        {/* Question pane */}
        <div className="border rounded p-4 overflow-y-auto">
          <h2 className="text-xl font-bold mb-2">
            {q.title || `Question ${active + 1}`}
          </h2>
          <div className="prose max-w-none whitespace-pre-wrap mb-4">
            {q.question || q.description}
          </div>

          <div>
            <h4 className="font-semibold">Input</h4>
            <pre className="bg-gray-100 p-2 rounded">
              {q.input || "<no input specified>"}
            </pre>
          </div>

          <div className="mt-3">
            <h4 className="font-semibold">Expected Output</h4>
            <pre className="bg-gray-100 p-2 rounded">
              {q.expectedOutput ?? "<no expected output>"}
            </pre>
          </div>
        </div>

        {/* Editor + Result pane */}
        <div className="flex flex-col border rounded overflow-hidden">
          <div className="p-3 border-b flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Language:{" "}
              <strong>
                {languageId === 71
                  ? "python"
                  : languageId === 62
                  ? "java"
                  : languageId === 54
                  ? "cpp"
                  : languageId === 50
                  ? "c"
                  : "javascript"}{" "}
              </strong>
            </div>
            <div className="text-xs text-gray-500">
              Attempt: {attemptId ?? "—"}
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            {/* Monaco editor */}
            <Editor
              height="100%"
              defaultLanguage="javascript"
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
              value={code}
              theme="vs-dark"
              options={{
                fontSize: 14,
                automaticLayout: true,
                minimap: { enabled: false },
              }}
              onChange={(val: any) => setCode(val ?? "")}
            />
            {/* If you don't have monaco, replace the editor above with:
              <textarea className="w-full h-full p-3 font-mono" value={code} onChange={(e)=>setCode(e.target.value)} />
            */}
          </div>

          {/* run output */}
          <div
            className="p-3 border-t bg-gray-50 overflow-y-auto"
            style={{ maxHeight: 220 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">Run Result</div>
              <div className="text-xs text-gray-500">
                Time: {runResult?.time ?? "-"}, Mem: {runResult?.memory ?? "-"}
              </div>
            </div>

            {runResult ? (
              <>
                {runResult.status && (
                  <div className="mb-2">
                    <strong>Status:</strong>{" "}
                    {runResult.status.description ||
                      runResult.status?.message ||
                      JSON.stringify(runResult.status)}
                  </div>
                )}
                {runResult.compile_output && (
                  <div className="mb-2">
                    <div className="text-xs font-semibold">Compile Output</div>
                    <pre className="bg-white p-2 rounded">
                      {runResult.compile_output}
                    </pre>
                  </div>
                )}
                <div className="mb-2">
                  <div className="text-xs font-semibold">Stdout</div>
                  <pre className="bg-white p-2 rounded">
                    {runResult.stdout ?? "<no output>"}
                  </pre>
                </div>
                {runResult.stderr && (
                  <div className="mb-2">
                    <div className="text-xs font-semibold">Stderr</div>
                    <pre className="bg-white p-2 rounded">
                      {runResult.stderr}
                    </pre>
                  </div>
                )}

                {/* pass/fail if expected output provided */}
                {q.expectedOutput != null && (
                  <div
                    className={`px-3 py-2 rounded ${
                      runResult.passed
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {runResult.passed
                      ? "Passed (output matched expected)"
                      : "Failed (output did not match expected)"}
                  </div>
                )}
              </>
            ) : (
              <div className="text-sm text-gray-500">No run yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
