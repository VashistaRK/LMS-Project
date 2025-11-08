/* eslint-disable */
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { startAttempt, submitAttempt, getTest } from "../services/assessmentApi";

type LoadedQuestion = {
  type: "MCQ" | "Descriptive";
  question: string;
  options?: string[];
  points?: number;
  qIndex?: number;
};

const baseURL= import.meta.env.VITE_API_URL;

export default function TestPage() {
  const { id, testId } = useParams<{ id?: string; testId?: string }>();
  const [answers, setAnswers] = useState<Record<number, number | string>>({});
  const [questions, setQuestions] = useState<LoadedQuestion[]>([]);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [title, setTitle] = useState<string>("");
  const [durationSec, setDurationSec] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [ended, setEnded] = useState(false);
  const navigate = useNavigate();

  // store attemptId in ref so async handlers can access latest value
  const attemptIdRef = useRef<string | null>(null);
  attemptIdRef.current = attemptId;

  // fetch test metadata only on mount (do NOT start attempt / fullscreen here)
  useEffect(() => {
    (async () => {
      if (!id || !testId) return;
      try {
        const meta = await getTest(id, testId);
        setTitle(meta.title ?? "");
        setDurationSec(meta.durationSec ?? 0);
      } catch (err) {
        console.error("Failed to load test metadata", err);
        alert("Failed to load test. Returning to practice list.");
        try { navigate("/freshers-pratice"); } catch {}
      }
    })();
    // cleanup on unmount: ensure fullscreen exited
    return () => {
      if (document.fullscreenElement) {
        try { document.exitFullscreen(); } catch { /* ignore */ }
      }
    };
  }, [id, testId]);

  // store MCQ answers as option index (number); descriptive as string
  const handleMCQ = (qid: number, optionIndex: number) => {
    setAnswers((s) => ({ ...s, [qid]: optionIndex }));
  };

  const handleDesc = (qid: number, value: string) => {
    setAnswers((s) => ({ ...s, [qid]: value }));
  };

  // start attempt — MUST be called from user gesture (button click) so requestFullscreen is allowed
  const doStart = async () => {
    if (!id || !testId) return;
    try {
      // request fullscreen first (user gesture)
      const el = containerRef.current ?? document.documentElement;
      try {
        if (el.requestFullscreen) await el.requestFullscreen();
      } catch (fsErr) {
        // fullscreen may fail on some browsers; continue to start attempt anyway
        console.warn("requestFullscreen failed or blocked, continuing without fullscreen", fsErr);
      }

      // call startAttempt (server) to create snapshot & attempt
      const res = await startAttempt(id, testId);
      setQuestions((res.questions || []).map((q: any) => ({ ...q })));
      setAttemptId(res.attemptId ?? null);
      setDurationSec(res.durationSec ?? 0);
      setEnded(false);

      // setup enforcement listeners
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "F11" || e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
        }
      };
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
          try { await document.exitFullscreen(); } catch { /* ignore */ }
        }
        alert("Test ended due to focus change or fullscreen exit.");
        try { navigate("/freshers-pratice"); } catch { /* ignore */ }
        // remove listeners
        document.removeEventListener("keydown", onKeyDown, true);
        document.removeEventListener("visibilitychange", onVisibility);
        window.removeEventListener("blur", onBlur);
        document.removeEventListener("fullscreenchange", onFsChange);
      };

      const onVisibility = () => {
        if (document.visibilityState !== "visible") terminate();
      };
      const onBlur = () => terminate();
      const onFsChange = () => {
        if (!document.fullscreenElement) terminate();
      };

      document.addEventListener("visibilitychange", onVisibility);
      window.addEventListener("blur", onBlur);
      document.addEventListener("fullscreenchange", onFsChange);
    } catch (err) {
      console.error("Failed to start attempt", err);
      alert("Failed to start test. Returning to practice list.");
      try { navigate("/freshers-pratice"); } catch { /* ignore */ }
    }
  };

  const handleSubmit = async () => {
    if (!attemptId) {
      alert("No active attempt to submit.");
      try { navigate("/freshers-pratice"); } catch {}
      return;
    }

    // validation: find unanswered required MCQs/descriptive count
    const unanswered = questions.reduce((acc, _q, idx) => {
      const has = Object.prototype.hasOwnProperty.call(answers, idx);
      if (!has) acc.push(idx);
      return acc;
    }, [] as number[]);

    if (unanswered.length > 0) {
      const ok = window.confirm(
        `You have ${unanswered.length} unanswered question(s). Do you want to submit anyway?`
      );
      if (!ok) return;
    }

    const payload = Object.keys(answers).map((qIndex) => ({
      qIndex: Number(qIndex),
      value: answers[Number(qIndex)],
    }));

    try {
      const res = await submitAttempt(attemptId, payload);
      if (document.fullscreenElement) {
        try { await document.exitFullscreen(); } catch { /* ignore */ }
      }
      alert(`Submitted! Score: ${res.score ?? 0}/${res.total ?? 0}`);
      try { navigate("/freshers-pratice"); } catch { /* ignore */ }
    } catch (err) {
      console.error("Submit failed", err);
      alert("Failed to submit attempt. Please try again.");
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-6xl mx-auto px-8">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">Assessment: {title || testId || "—"}</h1>
          <p className="text-gray-600 text-sm mt-2">Category: {id ?? "—"}</p>
        </div>

        {!attemptId ? (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <p className="mb-4 text-gray-700">Duration: {durationSec} seconds</p>
            <button
              onClick={doStart}
              className="inline-flex items-center gap-2 px-6 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-[#C21817] to-[#A51515] hover:opacity-95 shadow-md"
            >
              Start Assessment
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {questions.map((q, idx) => (
                <div key={idx} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <h3 className="font-semibold text-lg mb-4 text-gray-900">
                    Q{idx + 1}. {q.question}
                  </h3>

                  {q.type === "MCQ" && (
                    <div className="flex flex-col gap-2">
                      {q.options?.map((opt: string, i: number) => (
                        <label key={i} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`q-${idx}`}
                            value={i}
                            checked={answers[idx] === i}
                            onChange={() => handleMCQ(idx, i)}
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  )}

                  {q.type === "Descriptive" && (
                    <textarea
                      className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-200"
                      rows={4}
                      placeholder="Write your answer here..."
                      value={(answers[idx] as string) || ""}
                      onChange={(e) => handleDesc(idx, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-8">
              <span className="text-gray-500 text-sm">Please review your answers before submitting.</span>
              <button
                className="inline-flex items-center gap-2 px-6 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-[#C21817] to-[#A51515] hover:opacity-95 shadow-md"
                onClick={handleSubmit}
              >
                Submit Assessment
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
