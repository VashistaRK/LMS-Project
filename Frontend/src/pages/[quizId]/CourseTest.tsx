import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { markQuizCompleted } from "../../services/userApi";
import { useAuthContext } from "../../context/AuthProvider";
import { CheckCircle } from "lucide-react";

export interface Question {
  id: number;
  question: string;
  options: string[];
  answer: string;
}

const Api = import.meta.env.VITE_API_URL + "/api/questions/quiz";

export default function QuizPage() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const { quizId, courseId } = useParams<{
    quizId: string;
    courseId: string;
  }>();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [completed, setCompleted] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(20); // seconds for timer

  const { data: questions = [], isLoading } = useQuery<Question[]>({
    queryKey: ["quiz-questions", quizId],
    queryFn: async () => {
      const res = await axios.get(`${Api}/${quizId}`);
      const data: Question[] = res.data;
      if (!data || data.length === 0) throw new Error("Empty data");
      return data;
    },
    enabled: !!quizId,
  });



  const handleNext = useCallback(() => {
    if (currentIndex + 1 <= questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelected(null);
      setAnswered(false);
      setTimeLeft(20);
    }
  }, [currentIndex, questions.length]);

  const handleAnswer = useCallback(
    (opt: string | null) => {
      if (answered) return;
      setAnswered(true);
      setSelected(opt);

      if (opt && opt === questions[currentIndex].answer) {
        setScore((prev) => prev + 1);
      }

      setCompleted((prev) =>
        prev.includes(currentIndex) ? prev : [...prev, currentIndex]
      );
      handleNext();
    },
    [answered, currentIndex, questions, handleNext]
  );

  // Timer countdown
  useEffect(() => {
    if (answered || currentIndex >= questions.length) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          handleAnswer(null); // auto-submit if time runs out
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [answered, currentIndex, questions.length, handleAnswer]);

  const handleBackToCourse = async () => {
    if (!user || !courseId || !quizId) return;
    try {
      await markQuizCompleted(user.sub, courseId, quizId, score);
      navigate(-1);
    } catch (err) {
      console.error("Failed to update quiz completion:", err);
    }
  };

  // Exit the quiz when the user presses Escape: save progress and go back
  useEffect(() => {
    const onKeyDown = async (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (!user || !courseId || !quizId) return;
        try {
          await markQuizCompleted(user.sub, courseId, quizId, score);
          navigate(-1);
        } catch (err) {
          console.error("Error while exiting quiz on Escape:", err);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // depend on navigate and markQuizCompleted/user/courseId/quizId/score
  }, [navigate, user, courseId, quizId, score]);

  if (isLoading) return <p className="text-center mt-10">Loading quiz...</p>;
  if (questions.length === 0)
    return <p className="text-center mt-10">No questions found.</p>;

  if (currentIndex >= questions.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
        <h1 className="text-3xl font-bold mb-4">Quiz Finished 🎉</h1>
        <p className="text-xl font-semibold">
          Your Score: {score} / {questions.length}
        </p>
        <button
          onClick={handleBackToCourse}
          className="bg-gray-600 p-4 rounded-2xl mt-10 text-white hover:scale-110"
        >
          Back to course
        </button>
      </div>
    );
  }

  const q = questions[currentIndex];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* LEFT: Question area */}
      <main className="flex-1 px-6 py-10 max-w-3xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8">
          {q.question}
        </h1>

        <div className="space-y-4">
          {q.options.map((opt, idx) => {
            const letter = String.fromCharCode(65 + idx);
            const isSelected = selected === opt;
            return (
              <button
                key={opt}
                onClick={() => !answered && setSelected(opt)}
                className={`w-full text-left px-5 py-4 rounded-xl border flex items-center
                  transition ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200 bg-white hover:border-emerald-400 hover:bg-emerald-50"
                  }`}
              >
                <span
                  className={`w-8 h-8 flex items-center justify-center rounded-full mr-4 border
                    ${
                      isSelected
                        ? "bg-emerald-500 text-white border-emerald-500"
                        : "border-gray-300 text-gray-600"
                    }`}
                >
                  {letter}
                </span>
                <span className="flex-1 text-gray-700 font-medium">{opt}</span>
                {isSelected && (
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                )}
              </button>
            );
          })}
        </div>

        {!answered ? (
          <button
            onClick={() => handleAnswer(selected)}
            disabled={!selected}
            className={`mt-8 px-8 py-3 rounded-full text-white font-semibold
              ${
                selected
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-gray-300 cursor-not-allowed"
              }
            `}
          >
            Submit Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="mt-8 px-8 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
          >
            Next Question
          </button>
        )}
      </main>

      {/* RIGHT: Timer & list */}
      <aside className="md:w-72 w-full bg-white md:border-l border-t md:border-t-0 px-6 py-10 shadow-sm">
        {/* Timer */}
        <div className="mb-8 flex flex-col items-center">
          <div className="relative w-24 h-24">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="44"
                stroke="#e5e7eb"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="48"
                cy="48"
                r="44"
                stroke="#10b981"
                strokeWidth="6"
                fill="none"
                strokeDasharray={2 * Math.PI * 44}
                strokeDashoffset={2 * Math.PI * 44 * (1 - timeLeft / 20)}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-lg font-semibold text-gray-700">
              0:{timeLeft.toString().padStart(2, "0")}
            </span>
          </div>
          <p className="mt-3 text-sm text-gray-500">Time Remaining</p>
        </div>

        {/* Question List */}
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          Quiz Questions
        </h2>
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrentIndex(i);
                setSelected(null);
                setAnswered(completed.includes(i));
                setTimeLeft(20);
              }}
              className={`w-full text-left px-4 py-2 rounded-lg border text-sm font-medium
                flex items-center justify-between transition
                ${
                  completed.includes(i)
                    ? "bg-emerald-50 border-emerald-400 text-emerald-700"
                    : i === currentIndex
                    ? "bg-gray-100 border-gray-300"
                    : "bg-white border-gray-200 hover:bg-gray-50"
                }`}
            >
              Question {i + 1}
              {completed.includes(i) && (
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              )}
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}
