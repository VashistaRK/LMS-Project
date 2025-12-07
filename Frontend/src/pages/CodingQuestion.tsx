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
  const [input, setInput] = useState(savedValue?.input || "");
  const [runResult, setRunResult] = useState<any>(null);
  const [running, setRunning] = useState(false);
  const [fetchedQuestion, setFetchedQuestion] = useState<any>(null);

  const languageId = LANGUAGE_MAP[language];

  const Base = import.meta.env.VITE_API_BASE_URL || "";
  
  // Starter templates for common languages — only injected when editor is empty
  const getTemplate = (lang: string) => {
    switch (lang) {
      case "python":
        return `import sys\n\ndef solve():\n    data = sys.stdin.read()\n    print(data.strip())\n\nif __name__ == "__main__":\n    solve()`;
      case "javascript":
        return `const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf8');\nfunction solve(s) {\n  console.log(s.trim());\n}\nsolve(input);`;
      case "cpp":
        return `#include <bits/stdc++.h>\nusing namespace std;\nint main(){\n    ios::sync_with_stdio(false);cin.tie(nullptr);\n    string line, out;\n    bool first=true;\n    while(getline(cin,line)) { if(!first) out += "\\n"; out += line; first=false;}\n    cout<<out;\n    return 0;\n}`;
      case "java":
        return `import java.util.*;\npublic class Main{\n  public static void main(String[] args){\n    Scanner sc=new Scanner(System.in); StringBuilder sb=new StringBuilder();\n    while(sc.hasNextLine()){ sb.append(sc.nextLine()); if(sc.hasNextLine()) sb.append('\\n'); }\n    System.out.print(sb.toString().trim());\n  }\n}`;
      default:
        return "";
    }
  };

  // When language changes, if editor is empty prefer to fill a small template
  useEffect(() => {
    if ((!code || code.trim() === "") && language) {
      const t = getTemplate(language);
      if (t) setCode(t);
      console.log("Inserted template for", question);
    }
  }, [language]);

  // If the incoming `question` prop is minimal and contains a `bankId`,
  // attempt to fetch the full question data from the backend.
  useEffect(() => {
    let mounted = true;
    const bankId = question?.bankId || question?.bank_id || question?.bankid;
    if (!bankId) return;

    const tryFetch = async () => {
      const endpoints = [
        `${Base}/api/code/${bankId}`,
      ];

      for (const ep of endpoints) {
        try {
          const res = await axios.get(ep);
          if (res?.data) {
            if (!mounted) return;
            setFetchedQuestion(res.data?.question ?? res.data);
            return;
          }
        } catch {
          // try next
        }
      }
    };

    tryFetch();

    return () => {
      mounted = false;
    };
  }, []);

  // ----------------------------------------------------------------------
  // ⭐ RUN CODE — your desired structure using useCallback
  // ----------------------------------------------------------------------
  const runCode = useCallback(async () => {
    const activeQuestion = fetchedQuestion ?? question;
    if (!activeQuestion) return;

    setRunning(true);
    setRunResult(null);

    try {
      // Ensure stdin ends with a newline so programs reading lines behave correctly
      const stdinVal = input !== undefined && input !== null ? String(input) : "";
      const payload = {
        source_code: code,
        language_id: languageId,
        stdin: stdinVal === "" ? "" : (stdinVal.endsWith("\n") ? stdinVal : stdinVal + "\n"),
        expected_output: activeQuestion.expectedOutput ?? null,
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
      if (activeQuestion.expectedOutput != null) {
        const clean = (x: string) => x?.trim();
        result.passed =
          clean(result.stdout) === clean(activeQuestion.expectedOutput || "");
      }

      setRunResult(result);
    } catch (err) {
      console.error(err);
      setRunResult({ error: "Execution failed", details: err });
    } finally {
      setRunning(false);
    }
  }, [code, input, languageId, question, fetchedQuestion]);

  // ----------------------------------------------------------------------
  // SAVE ANSWER TO PARENT
  // ----------------------------------------------------------------------
  const saveAnswer = () => {
    setAnswer({
      code,
      input,
      language,
      lastRun: runResult || null,
      bankId: (fetchedQuestion ?? question)?.bankId ?? (fetchedQuestion ?? question)?.bank_id ?? (fetchedQuestion ?? question)?.bankid,
    });
  };

  // ----------------------------------------------------------------------
  // RENDER UI
  // ----------------------------------------------------------------------
  const activeQuestion = fetchedQuestion ?? question;

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Left: Question details */}
      <div className="col-span-5 bg-white dark:bg-gray-800 p-5 rounded-lg border">
        <h2 className="text-xl font-bold mb-2">{activeQuestion?.title || "Coding Question"}</h2>
        <div className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-line mb-4">
          {activeQuestion?.description || "No description provided."}
        </div>

        {activeQuestion?.examples && activeQuestion.examples.length > 0 && (
          <div className="mb-3">
            <h3 className="font-semibold">Examples</h3>
            <ul className="list-disc list-inside text-sm mt-2">
              {activeQuestion.examples.map((ex: any, idx: number) => (
                <li key={idx} className="font-mono text-sm">{ex}</li>
              ))}
            </ul>
          </div>
        )}

        {activeQuestion?.testCases && activeQuestion.testCases.length > 0 && (
          <div className="mb-3">
            <h3 className="font-semibold">Sample Testcase</h3>
            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded text-sm font-mono">
              <div><strong>Input:</strong> {activeQuestion.testCases[0].input}</div>
              <div><strong>Output:</strong> {activeQuestion.testCases[0].output}</div>
            </div>
          </div>
        )}

        {activeQuestion?.constraints && (
          <div className="mb-2">
            <h3 className="font-semibold">Constraints</h3>
            <pre className="text-sm mt-2 whitespace-pre-wrap">{activeQuestion.constraints}</pre>
          </div>
        )}

        {activeQuestion?.tags && activeQuestion.tags.length > 0 && (
          <div className="mt-3">
            <h3 className="font-semibold">Tags</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {activeQuestion.tags.map((t: string, i: number) => (
                <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">{t}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right: Editor + Controls */}
      <div className="col-span-7 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold">Language:</label>
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

          <div className="flex items-center gap-3">
            <button onClick={saveAnswer} className="px-4 py-2 bg-green-600 text-white rounded">Save</button>
            <button onClick={runCode} disabled={running} className="px-4 py-2 bg-blue-600 text-white rounded">{running ? 'Running...' : 'Run'}</button>
          </div>
        </div>

        <div className="h-[420px] border rounded overflow-hidden">
          <Editor
            height="100%"
            theme="vs-dark"
            language={language}
            value={code}
            onChange={(v) => setCode(v || "")}
            options={{ minimap: { enabled: false }, fontSize: 14, automaticLayout: true }}
          />
        </div>

        <div>
          <label className="font-semibold text-sm">Custom Input (optional):</label>
          <textarea
            value={input}
            disabled={!!result}
            onChange={(e) => setInput(e.target.value)}
            rows={4}
            className="w-full border border-gray-300 rounded-lg p-3 mt-2"
            placeholder="Custom input..."
          />
        </div>

        <div className="bg-gray-900 text-white p-4 rounded-lg min-h-[120px]">
          <div className="font-semibold mb-2 text-gray-300">Output:</div>
          {runResult ? (
            <pre className="whitespace-pre-wrap text-sm">{runResult.stdout || runResult.stderr || runResult.compile_output || runResult.error || 'No output'}</pre>
          ) : (
            <pre className="text-sm opacity-50">Run code to see output</pre>
          )}

          {runResult?.passed !== undefined && (
            <div className={`mt-3 p-2 rounded text-sm ${runResult.passed ? 'bg-green-700' : 'bg-red-700'}`}>
              {runResult.passed ? '✔ Passed' : '✘ Failed'}
            </div>
          )}
        </div>

        {result && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">⚠ Coding question submitted. Code locked for evaluation.</div>
        )}
      </div>
    </div>
  );
}
