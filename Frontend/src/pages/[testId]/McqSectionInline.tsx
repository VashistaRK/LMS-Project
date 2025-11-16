// src/pages/test/McqSectionInline.tsx
import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { CheckCircle } from "lucide-react";

export interface QuestionType {
  _id?: string;
  id?: number;
  question?: string;
  questionText?: string;
  options?: string[];
  answer?: string;
}

interface Props {
  questions?: QuestionType[]; // if provided, use this instead of fetching by quizId param
  sectionIndex: number;
  onSave?: (result: { answers: Record<string, string | null> }) => void;
  onFinish?: () => void;
}

const ApiBase = (import.meta.env.VITE_API_URL || "") + "/api/questions/quiz";

export default function McqSectionInline({ questions: questionsProp, onSave, onFinish }: Props) {
  const params = useParams<{ quizId?: string; courseId?: string }>();
  const quizIdFromParams = params.quizId;

  const [questions, setQuestions] = useState<QuestionType[]>(questionsProp ?? []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [, setCompleted] = useState<number[]>([]);
  const [, setTimeLeft] = useState(20); // per-question timer default

  // If no questions prop, fetch based on quizId param (backwards compatibility)
  useEffect(() => {
    if (questionsProp && questionsProp.length) {
      setQuestions(questionsProp);
      return;
    }
    if (!quizIdFromParams) return;
    let mounted = true;
    (async () => {
      try {
        const res = await axios.get(`${ApiBase}/${quizIdFromParams}`);
        if (!mounted) return;
        setQuestions(res.data || []);
      } catch (err) {
        console.error("Failed to load questions for mcq section", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [questionsProp, quizIdFromParams]);

  useEffect(() => {
    setSelected(null);
    setAnswered(false);
    setTimeLeft(20);
  }, [currentIndex, questions.length]);

  const handleNext = useCallback(() => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelected(null);
      setAnswered(false);
      setTimeLeft(20);
    } else {
      // finished section -> save/finish
      const answerMap: Record<string, string | null> = {};

      questions.forEach((q, idx) => {
        answerMap[q._id!] = userAnswersRef.current[idx] ?? null;
      });

      const payload = { answers: answerMap };

      onSave?.(payload);
      onFinish?.();
    }
  }, [currentIndex, questions.length, onSave, onFinish]);

  // Local answers
  const [score, setScore] = useState(0);
  const userAnswersRef = React.useRef<Record<number, string | null>>({});

  const handleAnswer = useCallback(
    (opt: string | null) => {
      if (answered) return;
      setAnswered(true);
      setSelected(opt);
      // save
      userAnswersRef.current[currentIndex] = opt;
      // update score instantly
      const q = questions[currentIndex];
      const correct = (q.answer ?? q.answer) as any;
      const isCorrect =
        opt != null &&
        (typeof correct === "number"
          ? String(correct) === String(opt)
          : String(correct) === String(opt));
      if (isCorrect) setScore((s) => s + 1);

      setCompleted((prev) => (prev.includes(currentIndex) ? prev : [...prev, currentIndex]));
      // auto go next after a small delay so user sees feedback
      setTimeout(() => handleNext(), 700);
    },
    [answered, currentIndex, questions, handleNext]
  );

  // per question timer
  useEffect(() => {
    if (answered || currentIndex >= questions.length) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          handleAnswer(null);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [answered, currentIndex, questions.length, handleAnswer]);

  if (!questions || questions.length === 0)
    return <div className="p-6 text-center">No questions found in this section.</div>;

  if (currentIndex >= questions.length) {
    // finished UI
    return (
      <div className="p-6 text-center">
        <h3 className="text-xl font-semibold">Section complete</h3>
        <p className="mt-2">Score: {score} / {questions.length}</p>
        <div className="mt-4">
          <button onClick={() => onFinish?.()} className="px-4 py-2 bg-green-600 text-white rounded">Continue</button>
        </div>
      </div>
    );
  }

  const q = questions[currentIndex];

  return (
    <div className="w-full space-y-6">

      {/* QUESTION */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          {q.question || q.questionText}
        </h2>

        {/* OPTIONS */}
        <div className="space-y-3">
          {q.options?.map((opt, idx) => {
            const letter = String.fromCharCode(65 + idx);
            const isSelected =
              selected === String(idx) || selected === opt;

            return (
              <button
                key={idx}
                onClick={() =>
                  !answered &&
                  handleAnswer(
                    typeof q.answer === "number"
                      ? String(idx)
                      : opt
                  )
                }
                className={`w-full text-left px-5 py-4 rounded-xl border flex items-center transition ${isSelected
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50"
                  }`}
              >
                <span
                  className={`w-8 h-8 flex items-center justify-center rounded-full mr-4 border ${isSelected
                    ? "bg-blue-500 text-white border-blue-500"
                    : "border-gray-300 text-gray-600"
                    }`}
                >
                  {letter}
                </span>

                <span className="flex-1 text-gray-700 font-medium">
                  {opt}
                </span>

                {isSelected && (
                  <CheckCircle className="w-5 h-5 text-blue-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );

}
