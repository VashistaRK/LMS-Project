// src/pages/test/CodingSectionInline.tsx
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import {
  CheckCircle, XCircle
} from "lucide-react";

type TestCase = { input: string; output: string };

export interface CodingQuestionType {
  _id: string;
  title: string;
  description?: string;
  examples?: any[];
  constraints?: string;
  starterCode?: string;
  functionName?: string;
  testCases?: TestCase[];
  difficulty?: "Easy" | "Medium" | "Hard";
  hints?: string[];
}

interface Props {
  questions?: CodingQuestionType[];
  sectionIndex: number;
  onSave?: (result: any) => void;
  onFinish?: () => void;
}

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function CodingSectionInline({ questions: questionsProp, onSave, onFinish }: Props) {
  const { quizId } = useParams<{ quizId?: string }>();
  const [question, setQuestion] = useState<CodingQuestionType | null>(questionsProp?.[0] ?? null);

  useEffect(() => {
    if (questionsProp && questionsProp.length > 0) {
      setQuestion(questionsProp[0]);
      return;
    }
    // fallback: fetch by quizId (backwards compat)
    if (!quizId) return;
    (async () => {
      try {
        const res = await fetch(`${API}/api/code/${quizId}`);
        if (!res.ok) throw new Error("Failed load coding question");
        const data = await res.json();
        setQuestion(data);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [questionsProp, quizId]);

  const [code, setCode] = useState<string>(question?.starterCode ?? "");
  useEffect(() => {
    if (question?.starterCode) setCode(question.starterCode);
  }, [question]);

  const runMutation = useMutation({
    mutationFn: async (payload: { code: string; testCases: TestCase[]; functionName?: string; language: string }) => {
      const res = await fetch(`${API}/api/code/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return res.json();
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (payload: { code: string; testCases: TestCase[]; functionName?: string; language: string; questionId?: string }) => {
      const res = await fetch(`${API}/api/code/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return res.json();
    },
  });

  const [results, setResults] = useState<any[]>([]);
  const [output, setOutput] = useState("");

  const runCode = async () => {
    if (!question) return;
    setOutput("");
    setResults([]);
    try {
      const data = await runMutation.mutateAsync({
        code,
        language: "javascript",
        testCases: question.testCases || [],
        functionName: question.functionName || "",
      });
      setResults(data.results || []);
      const allPassed = (data.results || []).every((r: any) => r.pass);
      setOutput(allPassed ? "All test cases passed ✅" : "Some test cases failed ❌");
      // optionally auto-save partial results
      onSave?.({ results: data.results });
    } catch (err) {
      console.error(err);
      setOutput("Failed to run code");
    }
  };

  const submitCode = async () => {
    if (!question) return;
    setOutput("");
    setResults([]);
    try {
      const data = await submitMutation.mutateAsync({
        code,
        language: "javascript",
        testCases: question.testCases || [],
        functionName: question.functionName || "",
        questionId: question._id,
      });
      setResults(data.results || []);
      setOutput(data.message || "Submission completed");
      onSave?.({
        [question._id]: {
          passedCount: data.passedCount ?? data.results?.filter((r: { pass: any; }) => r.pass).length ?? 0,
          total: question.testCases?.length || 0
        }
      });
      onFinish?.();
    } catch (err) {
      console.error(err);
      setOutput("Failed to submit");
    }
  };

  if (!question) {
    return <div className="p-6">No coding question found in this section.</div>;
  }

  return (
    <div className="w-full space-y-6">

      {/* TITLE */}
      <h2 className="text-2xl font-semibold">
        {question.title}
      </h2>
      <p className="text-gray-500">{question.difficulty}</p>

      {/* DESCRIPTION */}
      <p className="whitespace-pre-line">{question.description}</p>

      {/* EXAMPLES */}
      <div>
        <h3 className="font-semibold mb-2">Examples</h3>
        {question.testCases?.map((tc, i) => (
          <div key={i} className="p-3 rounded bg-gray-50 font-mono text-sm mb-2">
            <div><strong>Input:</strong> {tc.input}</div>
            <div><strong>Output:</strong> {tc.output}</div>
          </div>
        ))}
      </div>

      {/* EDITOR */}
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="w-full h-72 p-4 font-mono border rounded"
      />

      {/* BUTTONS */}
      <div className="flex gap-4">
        <button
          onClick={runCode}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Run
        </button>

        <button
          onClick={submitCode}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Submit
        </button>
      </div>

      {/* RESULTS */}
      <div>
        <h3 className="font-semibold mb-2">Results</h3>
        {results.map((r, i) => (
          <div key={i} className="p-3 mb-3 rounded bg-gray-50">
            <div className="flex items-center gap-2 mb-1">
              {r.pass ? (
                <CheckCircle className="text-green-500" />
              ) : (
                <XCircle className="text-red-500" />
              )}
              <span>Test {i + 1} — {r.pass ? "Passed" : "Failed"}</span>
            </div>
            <pre className="text-sm">{JSON.stringify(r, null, 2)}</pre>
          </div>
        ))}

        {output && (
          <div className="p-2 bg-gray-200 rounded font-mono text-sm">
            {output}
          </div>
        )}
      </div>

    </div>
  );

}
