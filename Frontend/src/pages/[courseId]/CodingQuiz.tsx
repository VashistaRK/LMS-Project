/*eslint-disable*/
import { useEffect, useState } from "react";
import {
  Play,
  Terminal,
  CheckCircle,
  XCircle,
  Clock,
  Trophy,
  Settings,
  Sun,
  Moon,
  Maximize2,
  Minimize2,
  RefreshCw,
  Send,
  Eye,
  EyeOff,
} from "lucide-react";
// import { useParams } from "react-router";
// import { useMutation, useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";

interface TestCase {
  input: string;
  output: string;
}

export interface Question {
  id?: string;
  title: string;
  description: string;
  examples: string[];
  constraints?: string;
  starterCode: string;
  functionName: string;
  runCases: TestCase[];
  testCases: TestCase[];
  difficulty: "Easy" | "Medium" | "Hard";
  hints?: string[];
  tags?: string[];
}

type Result = {
  input: any;
  expected: any;
  output?: any;
  pass?: boolean;
  error?: string;
  runtime?: string;
  memory?: string;
};

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function LeetCodeQuiz({
  sectionIndex,
  questions,
  onSave,
  onFinish,
}: {
  sectionIndex: number;
  questions: any[];
  onSave: (res: any) => void;
  onFinish: () => void;
}) {
  // const { quizId } = useParams<{ quizId: string }>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [code, setCode] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [results, setResults] = useState<Result[]>([]);
  const [activeTab, setActiveTab] = useState<
    "description" | "editorial" | "submissions" | "discussions"
  >("description");
  const [testTab, setTestTab] = useState<"testcase" | "result">("testcase");
  const [darkMode, setDarkMode] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [currentHint, setCurrentHint] = useState(0);
  const [fontSize, setFontSize] = useState(14);
  const JUDGE0_URL = "https://sunadhedutech.com/judge0";
  const [selectedLang, setSelectedLang] = useState(62);
  const LANGUAGES = [
    { id: 52, label: "C (GCC 12.2)", value: "c" },
    { id: 54, label: "C++ (G++ 12.2)", value: "cpp" },
    { id: 62, label: "Java (OpenJDK 17)", value: "java" },
    { id: 71, label: "Python 3.10", value: "python" },
    { id: 63, label: "JavaScript (Node.js)", value: "javascript" },
    { id: 74, label: "TypeScript", value: "typescript" },
    { id: 60, label: "Go", value: "go" },
    { id: 68, label: "PHP", value: "php" },
  ];

  // const { data: question, isLoading, error } = useQuery<Question>({
  //   queryKey: ["coding-quiz", quizId],
  //   queryFn: async () => {
  //     const res = await fetch(`${API}/api/code/${quizId}`);
  //     if (!res.ok) throw new Error("Failed to load question");
  //     return res.json();
  //   },
  //   enabled: !!quizId,
  // });

  const question: Question | undefined = questions[currentIndex];

  useEffect(() => {
    if (question?.starterCode) {
      setCode(question.starterCode);
    }
  }, [question]);

  const runMutation = useMutation({
    mutationFn: async (payload: {
      code: string;
      testCases: TestCase[];
      functionName: string;
      language: string;
    }) => {
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
    mutationFn: async (payload: {
      code: string;
      testCases: TestCase[];
      functionName: string;
      language: string;
      questionId: string | undefined;
    }) => {
      const res = await fetch(`${API}/api/code/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return res.json();
    },
  });

  const runCode = async () => {
    if (!question) return;

    setOutput("");
    setResults([]);

    const finalResults: Result[] = [];

    for (const tc of question.testCases) {
      try {
        const payload = {
          source_code: code,
          language_id: selectedLang,
          stdin: tc.input || "",
          expected_output: tc.output || "",
        };

        const url =
          `${JUDGE0_URL}/submissions?base64_encoded=false&wait=true&fields=` +
          `stdout,stderr,compile_output,status,time,memory,expected_output`;

        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const r = await res.json();
        console.log("Run result for test case:", r);

        // Judge0 status codes:
        // 1: In Queue, 2: Processing, 3: Accepted, 4-11: Various errors
        const statusId = r.status?.id;
        const isAccepted = statusId === 3;

        // Clean and compare outputs
        const clean = (x: string | null | undefined) => (x || "").trim().replace(/\r\n/g, "\n");
        const actualOutput = clean(r.stdout);
        const expectedOutput = clean(tc.output);

        // Check if output matches expected (only if status is Accepted)
        const outputMatches = isAccepted && actualOutput === expectedOutput;
        
        // Determine if test passed
        const pass = isAccepted && outputMatches && !r.stderr && !r.compile_output;

        // Get error message if any
        let errorMsg = "";
        if (!isAccepted) {
          const statusDesc = r.status?.description || "Unknown error";
          errorMsg = `Status: ${statusDesc}`;
        } else if (r.compile_output) {
          errorMsg = `Compilation Error: ${r.compile_output}`;
        } else if (r.stderr) {
          errorMsg = `Runtime Error: ${r.stderr}`;
        } else if (!outputMatches) {
          errorMsg = "Output does not match expected result";
        }

        finalResults.push({
          input: tc.input,
          expected: tc.output,
          output: actualOutput || r.stderr || r.compile_output || "",
          pass,
          error: errorMsg || undefined,
          runtime: r.time ? `${r.time}s` : undefined,
          memory: r.memory ? `${(r.memory / 1024).toFixed(2)} KB` : undefined,
        });
      } catch (err: any) {
        finalResults.push({
          input: tc.input,
          expected: tc.output,
          error: err.message || "Execution failed",
          pass: false,
        });
      }
    }

    const allPassed = finalResults.every((r) => r.pass);
    setResults(finalResults);
    setOutput(
      allPassed ? "All test cases passed! ✅" : "Some test cases failed ❌"
    );
  };

  const submitCode = async () => {
    if (!question) return;

    setOutput("");
    setResults([]);

    const finalResults: Result[] = [];

    for (const tc of question.testCases) {
      try {
        const payload = {
          source_code: code,
          language_id: selectedLang,
          stdin: tc.input || "",
          expected_output: tc.output || "",
        };

        const url =
          `${JUDGE0_URL}/submissions?base64_encoded=false&wait=true&fields=` +
          `stdout,stderr,compile_output,status,time,memory,expected_output`;

        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const r = await res.json();
        console.log("Submit result:", r);

        // Judge0 status codes:
        // 1: In Queue, 2: Processing, 3: Accepted, 4-11: Various errors
        const statusId = r.status?.id;
        const isAccepted = statusId === 3;

        // Clean and compare outputs
        const clean = (x: string | null | undefined) => (x || "").trim().replace(/\r\n/g, "\n");
        const actualOutput = clean(r.stdout);
        const expectedOutput = clean(tc.output);

        // Check if output matches expected (only if status is Accepted)
        const outputMatches = isAccepted && actualOutput === expectedOutput;
        
        // Determine if test passed
        const pass = isAccepted && outputMatches && !r.stderr && !r.compile_output;

        // Get error message if any
        let errorMsg = "";
        if (!isAccepted) {
          const statusDesc = r.status?.description || "Unknown error";
          errorMsg = `Status: ${statusDesc}`;
        } else if (r.compile_output) {
          errorMsg = `Compilation Error: ${r.compile_output}`;
        } else if (r.stderr) {
          errorMsg = `Runtime Error: ${r.stderr}`;
        } else if (!outputMatches) {
          errorMsg = "Output does not match expected result";
        }

        finalResults.push({
          input: tc.input,
          expected: tc.output,
          output: actualOutput || r.stderr || r.compile_output || "",
          pass,
          error: errorMsg || undefined,
          runtime: r.time ? `${r.time}s` : undefined,
          memory: r.memory ? `${(r.memory / 1024).toFixed(2)} KB` : undefined,
        });
      } catch (err: any) {
        finalResults.push({
          input: tc.input,
          expected: tc.output,
          error: err.message || "Execution failed",
          pass: false,
        });
      }
    }

    setResults(finalResults);

    const allPassed = finalResults.every((r) => r.pass);
    setOutput(
      allPassed ? "All test cases passed! 🎉" : "Some test cases failed ❌"
    );

    // save result for this question
    onSave({
      sectionIndex,
      questionIndex: currentIndex,
      code,
      results: finalResults,
    });

    // move to next question or finish
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onFinish();
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-500";
      case "Medium":
        return "text-yellow-500";
      case "Hard":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const bgClass = darkMode ? "bg-gray-900" : "bg-gray-50";
  const cardClass = darkMode
    ? "bg-gray-800 border-gray-700"
    : "bg-white border-gray-200";
  const textClass = darkMode ? "text-gray-100" : "text-gray-900";
  const mutedTextClass = darkMode ? "text-gray-400" : "text-gray-600";

  // if (isLoading) {
  //   return (
  //     <div
  //       className={`${bgClass} ${textClass} min-h-screen flex items-center justify-center`}
  //     >
  //       <div className="flex items-center space-x-2">
  //         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
  //         <span>Loading question...</span>
  //       </div>
  //     </div>
  //   );
  // }

  // if (error) {
  //   return (
  //     <div
  //       className={`${bgClass} ${textClass} min-h-screen flex items-center justify-center`}
  //     >
  //       <div className="text-center">
  //         <div className="text-red-500 text-xl mb-2">Error</div>
  //         <div className="text-gray-400">Failed to load question</div>
  //       </div>
  //     </div>
  //   );
  // }

  if (!question) {
    return (
      <div
        className={`${bgClass} ${textClass} min-h-screen flex items-center justify-center`}
      >
        <div className="text-center">
          <div className="text-gray-400">No question found</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${bgClass} ${textClass} min-h-screen transition-colors duration-200`}
    >
      {/* Header */}
      <div
        className={`${cardClass} border-b px-4 py-3 flex items-center justify-between`}
      >
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Terminal className="w-6 h-6 text-red-500" />
            <span className="font-bold text-lg">Sunadh Code</span>
          </div>
          <div className="flex items-center space-x-1">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="text-sm">Premium</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-lg ${
              darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
            } transition-colors`}
          >
            {darkMode ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={`p-2 rounded-lg ${
              darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
            } transition-colors`}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>

          <Settings className="w-4 h-4 cursor-pointer hover:text-gray-400" />
        </div>
      </div>

      <div
        className={`${
          isFullscreen ? "h-[calc(100vh-60px)]" : "h-[calc(100vh-60px)]"
        } flex`}
      >
        {/* Left Panel - Problem Description */}
        <div
          className={`${
            isFullscreen ? "w-0 overflow-hidden" : "w-1/2"
          } ${cardClass} border-r transition-all duration-300`}
        >
          <div className="flex border-b">
            {["description", "editorial", "submissions", "discussions"].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-4 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${
                    activeTab === tab
                      ? "border-red-500 text-red-500"
                      : "border-transparent hover:text-gray-400"
                  }`}
                >
                  {tab}
                </button>
              )
            )}
          </div>

          <div className="p-6 overflow-auto h-full">
            {activeTab === "description" && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold">{question.title}</h1>
                    <div className="flex items-center space-x-4">
                      <span
                        className={`text-sm font-medium ${getDifficultyColor(
                          question.difficulty
                        )}`}
                      >
                        {question.difficulty}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-line leading-relaxed">
                    {question.description}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Examples:</h3>
                  {question.testCases && question.testCases.length > 0 ? (
                    question.testCases.slice(0, 3).map((tc, i) => (
                      <div
                        key={i}
                        className={`${
                          darkMode ? "bg-gray-700" : "bg-gray-100"
                        } p-4 rounded-lg mb-3`}
                      >
                        <div className="font-mono text-sm">
                          <div>
                            <strong>Input:</strong> {tc.input}
                          </div>
                          <div>
                            <strong>Output:</strong> {tc.output}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div
                      className={`${
                        darkMode ? "bg-gray-700" : "bg-gray-100"
                      } p-4 rounded-lg`}
                    >
                      <div className="text-sm text-gray-500">
                        No test cases available
                      </div>
                    </div>
                  )}
                </div>

                {question.constraints && (
                  <div>
                    <h3 className="font-semibold mb-3">Constraints:</h3>
                    <div
                      className={`${
                        darkMode ? "bg-gray-700" : "bg-gray-100"
                      } p-4 rounded-lg`}
                    >
                      <pre className="text-sm whitespace-pre-wrap">
                        {question.constraints}
                      </pre>
                    </div>
                  </div>
                )}

                {question.tags && question.tags.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Tags:</h3>
                    <div className="flex flex-wrap gap-2">
                      {question.tags.map((tag, i) => (
                        <span
                          key={i}
                          className={`px-3 py-1 text-xs rounded-full ${
                            darkMode ? "bg-gray-700" : "bg-gray-200"
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {question.hints && question.hints.length > 0 && (
                  <div>
                    <button
                      onClick={() => setShowHints(!showHints)}
                      className="flex items-center space-x-2 text-red-500 hover:text-red-600 transition-colors"
                    >
                      {showHints ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                      <span className="font-medium">
                        {showHints
                          ? "Hide Hints"
                          : `Show Hint (${currentHint + 1}/${
                              question.hints?.length ?? 0
                            })`}
                      </span>
                    </button>

                    {showHints && (
                      <div
                        className={`mt-3 p-4 rounded-lg ${
                          darkMode
                            ? "bg-yellow-900/20 border border-yellow-800"
                            : "bg-yellow-50 border border-yellow-200"
                        }`}
                      >
                        <p className="text-sm">{question.hints[currentHint]}</p>
                        {question.hints && question.hints.length > 1 && (
                          <div className="mt-3 flex space-x-2">
                            <button
                              onClick={() =>
                                setCurrentHint(Math.max(0, currentHint - 1))
                              }
                              disabled={currentHint === 0}
                              className="text-xs px-2 py-1 rounded bg-red-500 text-white disabled:opacity-50"
                            >
                              Previous
                            </button>
                            <button
                              onClick={() =>
                                setCurrentHint(
                                  Math.min(
                                    (question.hints?.length ?? 1) - 1,
                                    currentHint + 1
                                  )
                                )
                              }
                              disabled={
                                currentHint ===
                                (question.hints?.length ?? 1) - 1
                              }
                              className="text-xs px-2 py-1 rounded bg-red-500 text-white disabled:opacity-50"
                            >
                              Next
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            {activeTab === "editorial" && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold">Solution</h2>
                <div
                  className={`p-4 rounded-lg ${
                    darkMode
                      ? "bg-blue-900/20 border border-blue-800"
                      : "bg-blue-50 border border-blue-200"
                  }`}
                >
                  <p className="text-sm">
                    The key insight is to use a hash map to store numbers we've
                    seen and their indices. For each number, we check if its
                    complement (target - current number) exists in our map.
                  </p>
                </div>
              </div>
            )}
            {activeTab === "submissions" && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold">My Submissions</h2>
                <p className={mutedTextClass}>
                  No submissions yet. Submit your solution to see it here!
                </p>
              </div>
            )}
            {activeTab === "discussions" && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold">Discussions</h2>
                <p className={mutedTextClass}>
                  Join the discussion about this problem!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Code Editor */}
        <div
          className={`${
            isFullscreen ? "w-full" : "w-1/2"
          } flex flex-col transition-all duration-300`}
        >
          {/* Editor Header */}
          <div
            className={`${cardClass} border-b px-4 py-3 flex items-center justify-between`}
          >
            <div className="flex items-center space-x-4">
              <select
                className="p-2 border bg-black rounded w-40"
                value={selectedLang}
                onChange={(e) => setSelectedLang(Number(e.target.value))}
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.id}>
                    {lang.label}
                  </option>
                ))}
              </select>

              <div className="flex items-center space-x-2">
                <span className="text-sm">Font Size:</span>
                <button
                  onClick={() => setFontSize(Math.max(10, fontSize - 1))}
                  className="w-6 h-6 text-xs rounded bg-gray-600 hover:bg-gray-500"
                >
                  -
                </button>
                <span className="text-sm w-8 text-center">{fontSize}</span>
                <button
                  onClick={() => setFontSize(Math.min(20, fontSize + 1))}
                  className="w-6 h-6 text-xs rounded bg-gray-600 hover:bg-gray-500"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCode(question.starterCode || "")}
                className={`p-2 rounded ${
                  darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                } transition-colors`}
                title="Reset Code"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                onClick={() => {}}
                className={`px-3 py-1 text-sm rounded ${
                  darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                } transition-colors`}
              >
                Custom Input
              </button>
            </div>
          </div>

          {/* Code Editor */}
          <div className="flex-1 relative">
            <div
              className="h-full font-mono"
              style={{
                backgroundColor: darkMode ? "#1e1e1e" : "#ffffff",
                fontSize: `${fontSize}px`,
                lineHeight: "1.6",
              }}
            >
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={`w-full h-full p-4 resize-none border-none outline-none ${
                  darkMode
                    ? "bg-gray-900 text-gray-100"
                    : "bg-white text-gray-900"
                } font-mono`}
                style={{ fontSize: `${fontSize}px` }}
                spellCheck={false}
                placeholder="// Write your code here..."
              />
            </div>
          </div>

          {/* Test Cases / Results Panel */}
          <div className={`${cardClass} border-t h-64`}>
            <div className="flex border-b">
              <button
                onClick={() => setTestTab("testcase")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  testTab === "testcase"
                    ? "border-red-500 text-red-500"
                    : "border-transparent hover:text-gray-400"
                }`}
              >
                Testcase
              </button>
              <button
                onClick={() => setTestTab("result")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  testTab === "result"
                    ? "border-red-500 text-red-500"
                    : "border-transparent hover:text-gray-400"
                }`}
              >
                Test Result
              </button>
            </div>

            <div className="p-4 h-full overflow-auto">
              {testTab === "testcase" && (
                <div className="space-y-3">
                  {question.testCases && question.testCases.length > 0 ? (
                    question.testCases.map((tc, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded ${
                          darkMode ? "bg-gray-700" : "bg-gray-100"
                        }`}
                      >
                        <div className="text-sm font-mono">
                          <div className={mutedTextClass}>Input:</div>
                          <div className="mb-2">{tc.input}</div>
                          <div className={mutedTextClass}>output:</div>
                          <div>{tc.output}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={`text-center ${mutedTextClass} py-8`}>
                      <Terminal className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No test cases available</p>
                    </div>
                  )}
                </div>
              )}

              {testTab === "result" && (
                <div className="space-y-3">
                  {runMutation.isPending || submitMutation.isPending ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
                        <span>Running tests...</span>
                      </div>
                    </div>
                  ) : results && results.length > 0 ? (
                    results.map((result, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded ${
                          darkMode ? "bg-gray-700" : "bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          {result.pass ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                          <span className="text-sm font-medium">
                            Test Case {i + 1}{" "}
                            {result.pass ? "Passed" : "Failed"}
                          </span>
                        </div>

                        <div className="text-sm font-mono space-y-1">
                          <div>
                            <span className={mutedTextClass}>Input:</span>{" "}
                            {Array.isArray(result.input)
                              ? JSON.stringify(result.input)
                              : result.input}
                          </div>
                          <div>
                            <span className={mutedTextClass}>Expected:</span>{" "}
                            {typeof result.expected === "object"
                              ? JSON.stringify(result.expected)
                              : result.expected}
                          </div>
                          <div>
                            <span className={mutedTextClass}>Output:</span>{" "}
                            {result.output !== undefined
                              ? typeof result.output === "object"
                                ? JSON.stringify(result.output)
                                : result.output || "(empty)"
                              : "N/A"}
                          </div>
                          {result.error && (
                            <div className="text-red-400 mt-1">
                              <span className={mutedTextClass}>Error:</span>{" "}
                              {result.error}
                            </div>
                          )}
                          {result.runtime && (
                            <div className="flex space-x-4 text-xs mt-2">
                              <span>
                                <Clock className="w-3 h-3 inline mr-1" />
                                Runtime: {result.runtime}
                              </span>
                              {result.memory && (
                                <span>Memory: {result.memory}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={`text-center ${mutedTextClass} py-8`}>
                      <Terminal className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Run your code to see the results</p>
                    </div>
                  )}

                  {output &&
                    !runMutation.isPending &&
                    !submitMutation.isPending && (
                      <div
                        className={`mt-4 p-3 rounded ${
                          darkMode ? "bg-gray-700" : "bg-gray-100"
                        }`}
                      >
                        <pre className="text-sm whitespace-pre-wrap">
                          {output}
                        </pre>
                      </div>
                    )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div
            className={`${cardClass} border-t px-4 py-3 flex items-center justify-between`}
          >
            <div className="flex items-center space-x-2">
              <button
                onClick={runCode}
                disabled={runMutation.isPending}
                className={`flex items-center space-x-2 px-4 py-2 rounded text-sm font-medium transition-colors ${
                  darkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-100"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Play className="w-4 h-4" />
                <span>{runMutation.isPending ? "Running..." : "Run"}</span>
              </button>

              <button
                onClick={submitCode}
                disabled={submitMutation.isPending}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                <span>
                  {submitMutation.isPending ? "Submitting..." : "Submit"}
                </span>
              </button>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>Runtime: O(n)</span>
              <span>Memory: O(n)</span>
            </div>
            <button
              onClick={() => {
                if (currentIndex < questions.length - 1) {
                  setCurrentIndex((prev) => prev + 1);
                } else {
                  onFinish();
                }
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
