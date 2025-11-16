// src/pages/test/TestPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import McqSectionInline from "./McqSectionInline.tsx";
import CodingSectionInline from "./CodingSectionInline.tsx";
import { useAuthContext } from "@/context/AuthProvider.tsx";

type Section = {
  _id: string;
  title: string;
  type: "mcq" | "coding";
  questions: any[]; // array of McqQuestion or CodingQuestion
};

type Test = {
  _id: string;
  title: string;
  timeLimit?: number; // in minutes
  totalMarks?: number;
  sections: Section[];
  courseId?: string;
};

export default function TestPage1() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();

  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const { user } = useAuthContext();
  const [score, setScore] = useState<number | null>(null);

  // Global timer: if test.timeLimit exists, countdown minutes->seconds
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  useEffect(() => {
    if (!test?.timeLimit) {
      setRemainingSeconds(null);
      return;
    }
    setRemainingSeconds(test.timeLimit * 60);
  }, [test]);

  useEffect(() => {
    if (remainingSeconds === null) return;
    if (remainingSeconds <= 0) {
      // time up: auto-submit
      handleSubmitAll();
      return;
    }
    const id = setInterval(() => {
      setRemainingSeconds((s) => (s !== null ? s - 1 : s));
    }, 1000);
    return () => clearInterval(id);
  }, [remainingSeconds]);

  useEffect(() => {
    if (!testId) return;
    const fetchTest = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || ""}/tests/${testId}`);
        if (!res.ok) throw new Error("Failed to load test");
        const data = await res.json();
        setTest(data);
        setActiveSectionIndex(0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [testId]);

  // aggregate answers from child sections
  // We'll keep a simple structure: { [sectionIndex]: sectionResult }
  const [sectionResults, setSectionResults] = useState<Record<number, any>>({});

  const saveSectionResult = (index: number, payload: any) => {
    setSectionResults((prev) => ({ ...prev, [index]: payload }));
  };

  const sections = test?.sections ?? [];

  const handleNextSection = () => {
    if (activeSectionIndex < sections.length - 1) {
      setActiveSectionIndex((i) => i + 1);
    }
  };
  const handlePrevSection = () => {
    if (activeSectionIndex > 0) {
      setActiveSectionIndex((i) => i - 1);
    }
  };

  const formattedRemaining = useMemo(() => {
    if (remainingSeconds === null) return null;
    const m = Math.floor(remainingSeconds / 60);
    const s = remainingSeconds % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }, [remainingSeconds]);

  async function handleSubmitAll() {
    if (!test) return;

    const userId = user?.sub;
    if (!userId) {
      alert("User not logged in");
      return;
    }

    const payload = {
      testId,
      userId,
      courseId: test?.courseId,
      results: sectionResults,
      submittedAt: new Date().toISOString(),
      timeLeft: remainingSeconds,
    };

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || ""}/tests/${testId}/submit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        console.error("Submission failed", data);
        alert(data?.error || "Submission failed");
        return;
      }

      // 1️⃣ Save score to state so UI can show it
      setScore(data.score ?? null);
      console.log("Test submitted successfully", data);

      // 2️⃣ Show score for 2.5 seconds then navigate back
      setTimeout(() => {
        navigate(-1);
      }, 2500);

    } catch (err) {
      console.error("Submit error", err);
      alert("Failed to submit test");
    }
  }


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading test...</div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Test not found</div>
      </div>
    );
  }

  const activeSection = sections[activeSectionIndex];

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto space-y-4">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{test.title}</h1>
            <div className="text-sm text-gray-600">
              {sections.length} Section{sections.length !== 1 ? "s" : ""}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {formattedRemaining && (
              <div className="px-3 py-1 rounded bg-red-50 text-red-700 font-semibold">
                Time left: {formattedRemaining}
              </div>
            )}
            <button
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              onClick={() => {
                if (confirm("Submit test now?")) handleSubmitAll();
              }}
            >
              Submit Test
            </button>
          </div>
        </header>

        {/* Sections list / navigation */}
        <nav className="flex gap-2 overflow-auto">
          {sections.map((s, idx) => {
            const isActive = idx === activeSectionIndex;
            const completed = sectionResults[idx] != null;
            return (
              <button
                key={s._id}
                onClick={() => setActiveSectionIndex(idx)}
                className={`px-3 py-1 rounded border ${isActive ? "bg-red-600 text-white" : "bg-white"
                  } ${completed ? "ring-2 ring-green-300" : ""}`}
              >
                {idx + 1}. {s.title} ({s.type})
              </button>
            );
          })}
        </nav>

        {/* Active section area */}
        <main className="bg-white p-6 rounded shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              Section {activeSectionIndex + 1}: {activeSection.title}
            </h2>

            <div className="text-sm text-gray-500">
              {activeSection.type === "mcq" ? "MCQ Section" : "Coding Section"}
            </div>
          </div>

          <div>
            {activeSection.type === "mcq" ? (
              <McqSectionInline
                key={activeSection._id}
                sectionIndex={activeSectionIndex}
                questions={activeSection.questions}
                onSave={(res) => saveSectionResult(activeSectionIndex, res)}
                onFinish={() => handleNextSection()}
              // you can forward more props if needed
              />
            ) : (
              <CodingSectionInline
                key={activeSection._id}
                sectionIndex={activeSectionIndex}
                questions={activeSection.questions}
                onSave={(res) => saveSectionResult(activeSectionIndex, res)}
                onFinish={() => handleNextSection()}
              />
            )}
          </div>

          {/* Section navigation controls */}
          <div className="mt-6 flex justify-between">
            <div>
              <button
                onClick={handlePrevSection}
                disabled={activeSectionIndex === 0}
                className="px-4 py-2 rounded bg-gray-200 disabled:opacity-50"
              >
                Previous Section
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  // Save progress (ask child section to save first via sectionResults if needed)
                  if (confirm("Are you sure you want to submit this section and go next?")) {
                    handleNextSection();
                  }
                }}
                className="px-4 py-2 rounded bg-blue-600 text-white"
              >
                Save & Next
              </button>

              <button
                onClick={() => {
                  if (confirm("Submit entire test?")) handleSubmitAll();
                }}
                className="px-4 py-2 rounded bg-red-600 text-white"
              >
                Submit Test
              </button>
            </div>
          </div>
        </main>
      </div>
      {score !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 shadow-xl text-center max-w-sm">
            <h2 className="text-2xl font-bold mb-2">Test Submitted!</h2>
            <p className="text-lg mb-4">Your Score:</p>

            <div className="text-4xl font-extrabold text-green-600 mb-6">
              {score}
            </div>

            <p className="text-gray-600">Returning to course page...</p>
          </div>
        </div>
      )}
    </div>
  );
}
