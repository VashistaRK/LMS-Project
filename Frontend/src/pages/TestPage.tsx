/* eslint-disable */
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  startAttempt,
  submitAttempt,
  getTest,
} from "../services/assessmentApi";
import TechCodingTestPage from "./TechPage";

type LoadedQuestion = {
  type: "MCQ" | "Descriptive";
  question: string;
  options?: string[];
  points?: number;
  qIndex?: number; // index inside attempt snapshot
  correctAnswer?: number; // correct answer index from backend (answer field)
};

const baseURL = import.meta.env.VITE_API_URL;

export default function TestPage() {
  const { id, testId } = useParams<{ id?: string; testId?: string }>();
  if (id === "Tech") {
    return <TechCodingTestPage />;
  }
  const navigate = useNavigate();

  // answers keyed by displayed question index (0..n-1)
  const [answers, setAnswers] = useState<Record<number, number | string>>({});
  const [questions, setQuestions] = useState<LoadedQuestion[]>([]);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const attemptIdRef = useRef<string | null>(null);
  attemptIdRef.current = attemptId;

  const [title, setTitle] = useState<string>("");
  const [durationSec, setDurationSec] = useState<number>(0);
  const [ended, setEnded] = useState(false);
  const [score, setScore] = useState<{ score: number; total: number } | null>(
    null
  );
  const [resultDetails, setResultDetails] = useState<any[] | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const alertShownRef = useRef<boolean>(false);

  // UI: which question (0-based) is currently shown
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // listeners refs for cleanup
  const onVisibilityRef = useRef<(() => void) | null>(null);
  const onBlurRef = useRef<(() => void) | null>(null);
  const onFsChangeRef = useRef<(() => void) | null>(null);
  const onKeyDownRef = useRef<((e: KeyboardEvent) => void) | null>(null);

  // fetch metadata (title/duration) but do not start attempt automatically
  useEffect(() => {
    (async () => {
      if (!id || !testId) return;
      try {
        const meta = await getTest(id, testId);
        console.log("Test metadata", meta);
        setTitle(meta.title ?? "");
        setDurationSec(meta.durationSec ?? 0);
      } catch (err) {
        console.error("Failed to load test metadata", err);
        alert("Failed to load test. Returning to practice list.");
        try {
          navigate("/freshers-pratice");
        } catch {}
      }
    })();

    // cleanup fullscreen on unmount
    return () => {
      if (document.fullscreenElement) {
        try {
          document.exitFullscreen();
        } catch {}
      }
      // ensure listeners removed (just in case)
      removeAntiCheatListeners();
    };
  }, [id, testId]);

  // helper: mark if a question (by its displayed index) is answered
  const isAnswered = (index: number) => {
    if (!Object.prototype.hasOwnProperty.call(answers, index)) return false;
    const value = answers[index];
    if (typeof value === "string") {
      return value.trim().length > 0;
    }
    if (typeof value === "number") {
      // number indicates MCQ option index
      return !isNaN(value);
    }
    return !!value;
  };

  const handleMCQ = (qid: number, optionIndex: number) => {
    setAnswers((s) => ({ ...s, [qid]: optionIndex }));
  };

  const handleDesc = (qid: number, value: string) => {
    setAnswers((s) => ({ ...s, [qid]: value }));
  };

  // toggle question selection (sidebar click)
  const openQuestion = (index: number) => {
    if (index < 0 || index >= questions.length) return;
    setCurrentIndex(index);
  };

  // normalize question array mapping: server returns res.questions which we place directly
  // start attempt — triggered by user gesture (button click)
  const doStart = async () => {
    if (!id || !testId) return;

    // request fullscreen first (user gesture)
    const el = containerRef.current ?? document.documentElement;
    try {
      if (el.requestFullscreen) await el.requestFullscreen();
    } catch (fsErr) {
      console.warn(
        "request Fullscreen failed or blocked, continuing without fullscreen",
        fsErr
      );
    }

    try {
      const res = await startAttempt(id, testId);
      console.log("Started attempt", res);
      const qArr: LoadedQuestion[] = (res.questions || []).map((q: any) => ({
        type: q.type ?? "MCQ",
        question: q.question ?? "",
        options: Array.isArray(q.options) ? q.options : [],
        points: q.points ?? 0,
        qIndex: q.qIndex ?? undefined,
        correctAnswer: q.answer ?? undefined,
      }));

      setQuestions(qArr);
      setAttemptId(res.attemptId ?? null);
      attemptIdRef.current = res.attemptId ?? null;
      setDurationSec(res.durationSec ?? 0);
      setEnded(false);
      setAnswers({}); // clear previous answers
      setCurrentIndex(0);
      setScore(null); // clear previous score
      alertShownRef.current = false; // reset alert flag

      // attach anti-cheat listeners
      attachAntiCheatListeners();
    } catch (err) {
      console.error("Failed to start attempt", err);
      alert("Failed to start test. Returning to practice list.");
      try {
        navigate("/freshers-pratice");
      } catch {}
    }
  };

  // Attach anti-cheat listeners (visibilitychange / blur / fullscreenchange)
  const attachAntiCheatListeners = () => {
    removeAntiCheatListeners();

    const onKeyDown = (e: KeyboardEvent) => {
      // block typical fullscreen/exiting keys if possible (best effort)
      if (e.key === "F11" || e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    onKeyDownRef.current = onKeyDown;
    document.addEventListener("keydown", onKeyDown, true);

    const terminate = async (): Promise<void> => {
      if (ended) return;
      setEnded(true);
      const aId = attemptIdRef.current;
      if (aId) {
        try {
          await fetch(`${baseURL}/api/assessments/attempts/${aId}/terminate`, {
            method: "POST",
            credentials: "include",
          });
        } catch {
          /* noop */
        }
      }
      if (document.fullscreenElement) {
        try {
          await document.exitFullscreen();
        } catch {}
      }
      if (!alertShownRef.current) {
        alertShownRef.current = true;
        alert("Test ended due to focus change or fullscreen exit.");
      }
      try {
        navigate("/freshers-pratice");
      } catch {}
      removeAntiCheatListeners();
    };

    const onVisibility = () => {
      if (document.visibilityState !== "visible") terminate();
    };
    onVisibilityRef.current = onVisibility;
    document.addEventListener("visibilitychange", onVisibility);

    const onBlur = () => {
      void (async () => {
        await terminate();
      })();
    };
    onBlurRef.current = onBlur;
    window.addEventListener("blur", onBlur);

    const onFsChange = () => {
      if (!document.fullscreenElement) {
        void (async () => {
          await terminate();
        })();
      }
    };
    onFsChangeRef.current = onFsChange;
    document.addEventListener("fullscreenchange", onFsChange);
  };

  const removeAntiCheatListeners = () => {
    try {
      if (onKeyDownRef.current)
        document.removeEventListener("keydown", onKeyDownRef.current, true);
      if (onVisibilityRef.current)
        document.removeEventListener(
          "visibilitychange",
          onVisibilityRef.current
        );
      if (onBlurRef.current)
        window.removeEventListener("blur", onBlurRef.current);
      if (onFsChangeRef.current)
        document.removeEventListener("fullscreenchange", onFsChangeRef.current);
    } catch {
      /* ignore */
    }
    onKeyDownRef.current = null;
    onVisibilityRef.current = null;
    onBlurRef.current = null;
    onFsChangeRef.current = null;
  };

  // Submit attempt
  const handleSubmit = async () => {
    if (!attemptId) {
      alert("No active attempt to submit.");
      try {
        navigate("/freshers-pratice");
      } catch {}
      return;
    }

    // detect unanswered questions (just check presence)
    const unanswered = questions.reduce((acc: number[], _q, idx) => {
      const has =
        Object.prototype.hasOwnProperty.call(answers, idx) && isAnswered(idx);
      if (!has) acc.push(idx);
      return acc;
    }, [] as number[]);

    if (unanswered.length > 0) {
      const ok = window.confirm(
        `You have ${unanswered.length} unanswered question(s). Do you want to submit anyway?`
      );
      if (!ok) return;
    }

    // server expected qIndex: attempts snapshot used qIndex when creating attempt; but submitAttempt in your code uses qIndex numbers referencing snapshot index
    // Here we send qIndex as the displayed index (0..n-1)
    const payload = Object.keys(answers).map((qIndexStr) => ({
      qIndex: Number(qIndexStr),
      value: answers[Number(qIndexStr)],
    }));

    try {
      const res = await submitAttempt(attemptId, payload);
      setEnded(true);
      alertShownRef.current = true;
      removeAntiCheatListeners();

      // exit fullscreen (best-effort)
      if (document.fullscreenElement) {
        try {
          await document.exitFullscreen();
        } catch {}
      }

      setScore({ score: res.score ?? 0, total: res.total ?? 0 });

      // Evaluate answers using correctAnswer from question data
      // The correctAnswer field is already loaded with each question (from line 140)
      const details = (questions || []).map((q, idx) => {
        const submitted = answers[idx];
        const correct = q.correctAnswer; // Use correctAnswer from question data
        
        // For MCQ: compare submitted option index with correct answer index
        // For Descriptive: no auto-evaluation (manual grading)
        let isCorrect = false;
        if (q.type === "MCQ") {
          // Both should be numbers (option indices)
          if (typeof submitted === "number" && typeof correct === "number") {
            isCorrect = submitted === correct;
          } else if (submitted !== undefined && correct !== undefined) {
            // Fallback: compare as strings
            isCorrect = String(submitted) === String(correct);
          }
        }
        // Descriptive questions are not auto-evaluated

        return {
          index: idx,
          question: q.question,
          type: q.type,
          options: q.options ?? [],
          points: q.points ?? 0,
          submitted,
          correct,
          isCorrect,
        };
      });

      setResultDetails(details);

      // show results & answers UI instead of redirecting
      setShowAnswers(true);
    } catch (err) {
      console.error("Submit failed", err);
      alert("Failed to submit attempt. Please try again.");
    }
  };

  // Navigation helpers
  const goNext = () => {
    setCurrentIndex((i) => Math.min(i + 1, Math.max(0, questions.length - 1)));
  };
  const goPrev = () => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  };

  // Basic keyboard navigation (Left/Right)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!attemptId) return;
      if (e.key === "ArrowRight") {
        goNext();
      } else if (e.key === "ArrowLeft") {
        goPrev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [attemptId, questions.length]);

  // render
  return (
    <div ref={containerRef} className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Assessment: {title || testId || "—"}
          </h1>
          <p className="text-sm text-gray-600 mt-1">Category: {id ?? "—"}</p>
        </div>

        {!attemptId ? (
          <div className="bg-white rounded-2xl shadow p-6">
            <p className="mb-4 text-gray-700">Duration: {durationSec} seconds</p>
            <button
              onClick={doStart}
              className="inline-flex items-center gap-2 px-6 py-2 rounded-lg font-semibold text-white bg-blue-600 hover:opacity-95 shadow"
            >
              Start Assessment
            </button>
          </div>
        ) : (
          <>
            {score && (
              <div className="bg-white rounded-2xl shadow p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Assessment Submitted
                    </h2>
                    <div className="text-3xl font-bold text-blue-600 mt-2">
                      {score.score} / {score.total}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Results shown below — correct options are highlighted.
                    </div>
                  </div>
                  <div>
                    <button
                      onClick={() => {
                        try {
                          navigate("/freshers-pratice");
                        } catch {}
                      }}
                      className="px-4 py-2 rounded bg-blue-600 text-white font-medium hover:opacity-95"
                    >
                      Back to practice
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-12 gap-6">
            {/* Left Sidebar: Questions list */}
            <aside className="col-span-3">
              <div className="sticky top-6">
                <h2 className="font-semibold mb-3">Questions</h2>

                <div className="flex flex-wrap gap-2">
                  {questions.map((_q, idx) => {
                    const isCurrent = idx === currentIndex;
                    const detail = resultDetails && Array.isArray(resultDetails)
                      ? resultDetails[idx]
                      : null;

                    // Determine coloring: when results are shown, use correctness; otherwise use answered/current
                    const base =
                      "w-10 h-10 rounded-full flex items-center justify-center font-medium cursor-pointer select-none";

                    let cls = "bg-gray-200 text-gray-700";
                    if (showAnswers && detail) {
                      // Use isCorrect field from evaluation
                      if (detail.isCorrect === true) {
                        cls = "bg-green-500 text-white";
                      } else if (detail.isCorrect === false) {
                        cls = "bg-red-500 text-white";
                      } else if (typeof detail.submitted !== "undefined") {
                        // Descriptive or unanswered
                        cls = "bg-gray-300 text-gray-700";
                      } else {
                        cls = "bg-gray-200 text-gray-700";
                      }
                    } else {
                      const answered = isAnswered(idx);
                      cls = isCurrent
                        ? "bg-blue-500 text-white"
                        : answered
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-700";
                    }

                    if (isCurrent) cls += " ring-2 ring-offset-1 ring-blue-300";

                    return (
                      <button
                        key={idx}
                        aria-label={`Question ${idx + 1}`}
                        className={`${base} ${cls}`}
                        onClick={() => openQuestion(idx)}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6">
                  <p className="text-sm text-gray-600">
                    Answered:{" "}
                    <span className="font-semibold">
                      {
                        Object.keys(answers).filter((k) =>
                          isAnswered(Number(k))
                        ).length
                      }
                    </span>{" "}
                    / {questions.length}
                  </p>
                </div>
              </div>
            </aside>

            {/* Right: Single question view */}
            <main className="col-span-9">
              <div className="bg-white rounded-2xl shadow p-6">
                {questions.length === 0 ? (
                  <p className="text-gray-600">No questions loaded.</p>
                ) : (
                  <>
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Q{currentIndex + 1}. {questions[currentIndex]?.question}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Points: {questions[currentIndex]?.points ?? 0}
                      </p>
                    </div>

                    {questions[currentIndex]?.type === "MCQ" && (
                      <div className="flex flex-col gap-3">
                        {questions[currentIndex]?.options?.map((opt, i) => {
                          const checked = answers[currentIndex] === i;
                          const det = resultDetails && Array.isArray(resultDetails)
                            ? resultDetails[currentIndex]
                            : null;
                          const correctIndex = det && typeof det.correct !== 'undefined' && det.correct !== null ? Number(det.correct) : undefined;
                          const userSubmitted = typeof det?.submitted !== 'undefined' && det.submitted !== null ? Number(det.submitted) : (typeof answers[currentIndex] !== 'undefined' ? Number(answers[currentIndex]) : undefined);
                          const isCorrectOption = correctIndex === i;
                          const isUserAnswer = userSubmitted === i;
                          const isWrongAnswer = isUserAnswer && !isCorrectOption;

                          let optionClass = "flex items-center gap-4 p-4 rounded-lg border-2 transition-all";
                          if (showAnswers && det) {
                            if (isCorrectOption) {
                              optionClass += " bg-green-50 border-green-400";
                            } else if (isWrongAnswer) {
                              optionClass += " bg-red-50 border-red-400";
                            } else {
                              optionClass += " bg-gray-50 border-gray-200";
                            }
                          } else {
                            optionClass += checked 
                              ? " bg-blue-50 border-blue-400 cursor-pointer" 
                              : " bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer";
                          }

                          return (
                            <label key={i} className={optionClass}>
                              <input
                                type="radio"
                                name={`q-${currentIndex}`}
                                checked={checked}
                                onChange={() => handleMCQ(currentIndex, i)}
                                disabled={showAnswers}
                                className="w-5 h-5 text-blue-600"
                              />
                              <div className="flex-1">
                                <div className="font-medium text-gray-800">
                                  <span className="font-bold mr-2">{String.fromCharCode(65 + i)}.</span>
                                  {opt}
                                </div>
                              </div>
                              {showAnswers && det && (
                                <div className="flex items-center gap-2">
                                  {isCorrectOption && (
                                    <span className="text-green-600 font-bold text-sm">✓ Correct Answer</span>
                                  )}
                                  {isWrongAnswer && (
                                    <span className="text-red-600 font-bold text-sm">✗ Your Answer (Wrong)</span>
                                  )}
                                </div>
                              )}
                            </label>
                          );
                        })}
                      </div>
                    )}

                    {questions[currentIndex]?.type === "Descriptive" && (
                      <div>
                        <textarea
                          className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-200"
                          rows={6}
                          placeholder="Write your answer here..."
                          value={(answers[currentIndex] as string) || ""}
                          onChange={(e) =>
                            handleDesc(currentIndex, e.target.value)
                          }
                          disabled={showAnswers}
                        />
                        {showAnswers && (
                          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                            ⚠ This question requires manual grading and is not included in the auto-calculated score.
                          </div>
                        )}
                      </div>
                    )}

                    {/* Nav buttons */}
                    <div className="flex items-center justify-between mt-6">
                      <div className="flex gap-2">
                        <button
                          onClick={goPrev}
                          disabled={currentIndex === 0}
                          className={`px-4 py-2 rounded ${
                            currentIndex === 0
                              ? "bg-gray-200 text-gray-500"
                              : "bg-gray-800 text-white"
                          }`}
                        >
                          Previous
                        </button>

                        <button
                          onClick={goNext}
                          disabled={currentIndex === questions.length - 1}
                          className={`px-4 py-2 rounded ${
                            currentIndex === questions.length - 1
                              ? "bg-gray-200 text-gray-500"
                              : "bg-gray-800 text-white"
                          }`}
                        >
                          Next
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        {currentIndex < questions.length -1 && (
                          <button
                            onClick={() => {
                              const firstUnanswered = questions.findIndex(
                                (_, idx) => !isAnswered(idx)
                              );
                              if (firstUnanswered !== -1) {
                                openQuestion(firstUnanswered);
                              }
                            }}
                            className="px-4 py-2 rounded bg-blue-600 text-white"
                          >
                            Go to first unanswered
                          </button>
                        )}

                        <button
                          onClick={handleSubmit}
                          className="px-4 py-2 rounded bg-red-600 text-white"
                        >
                          Submit Assessment
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </main>
          </div>
          </>
        )}
      </div>
    </div>
  );
}
