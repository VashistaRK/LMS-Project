import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { CheckCircle } from "lucide-react";

export interface QuestionType {
  _id?: string;
  id?: number;
  question?: string;
  questionText?: string;
  options?: string[];
  correctAnswer?: number;
}

interface Props {
  questions?: QuestionType[];
  sectionIndex: number;
  onSave?: (result: {
    score: number;
    total: number;
    answers: Record<string, string | null>;
  }) => void;
  onFinish?: () => void;
}


const ApiBase = (import.meta.env.VITE_API_URL || "") + "/api/questions/quiz";

export default function McqSectionInline({ questions: questionsProp, onSave, onFinish }: Props) {
  const params = useParams<{ quizId?: string }>();
  const quizIdFromParams = params.quizId;

  const [questions, setQuestions] = useState<QuestionType[]>(questionsProp ?? []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);

  const userAnswersRef = useRef<Record<number, string | null>>({});
  const [score, setScore] = useState(0);

  // Fetch if no questions passed as props
  useEffect(() => {
    if (questionsProp && questionsProp.length) {
      setQuestions(questionsProp);
      console.log("Fetched MCQ questions:", questionsProp);
      return;
    }

    if (!quizIdFromParams) return;

    let mounted = true;
    (async () => {
      try {
        const res = await axios.get(`${ApiBase}/${quizIdFromParams}`);
        console.log("Fetched MCQ questions:", res.data);
        if (!mounted) return;
        setQuestions(res.data || []);
      } catch (err) {
        console.error("Failed to load questions", err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [questionsProp, quizIdFromParams]);

  const handleAnswer = (opt: string) => {
    if (answered) return;

    setSelected(opt);
    setAnswered(true);

    const q = questions[currentIndex];
    const correctIndex = q.correctAnswer;
    const chosenIndex = q.options?.indexOf(opt);

    const isCorrect = chosenIndex === correctIndex;
    if (isCorrect) setScore((s) => s + 1);

    userAnswersRef.current[currentIndex] = opt;
  };


  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      const answerMap: Record<string, string | null> = {};
      questions.forEach((q, idx) => {
        answerMap[q._id || String(idx)] = userAnswersRef.current[idx] ?? null;
      });

      onSave?.({
        score,
        total: questions.length,
        answers: answerMap
      });

      // Show score screen
      setCurrentIndex(questions.length);
      return;
    }
  };


  if (!questions || questions.length === 0) {
    return <div className="p-6 text-center">No questions available.</div>;
  }

  if (currentIndex >= questions.length) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold">Section Completed</h2>
        <p className="mt-3 text-lg">
          Score: {score} / {questions.length}
        </p>

        {/* This triggers navigation to next section */}
        <button
          onClick={() => onFinish?.()}
          className="mt-6 px-4 py-2 bg-green-600 text-white rounded-lg"
        >
          Continue to Next Section
        </button>
      </div>
    );
  }


  const q = questions[currentIndex];

  return (
    <div className="w-full space-y-6">
      {/* Question */}
      <h2 className="text-xl font-semibold mb-4">
        {q.question || q.questionText}
      </h2>

      {/* Options */}
      <div className="space-y-3">
        {q.options?.map((opt, idx) => {
          const letter = String.fromCharCode(65 + idx);
          const isSelected = selected === opt;

          return (
            <button
              key={idx}
              onClick={() => handleAnswer(opt)}
              disabled={answered}
              className={`w-full text-left px-5 py-4 rounded-xl border flex items-center transition 
                ${isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"}
              `}
            >
              <span
                className={`w-8 h-8 flex items-center justify-center rounded-full mr-4 border 
                  ${isSelected ? "bg-blue-500 text-white border-blue-500" : "border-gray-300 text-gray-600"}
                `}
              >
                {letter}
              </span>

              <span className="flex-1 text-gray-700 font-medium">
                {opt}
              </span>

              {isSelected && <CheckCircle className="w-5 h-5 text-blue-500" />}
            </button>
          );
        })}
      </div>

      {/* NEXT BUTTON */}
      <div className="pt-4">
        <button
          disabled={!answered}
          onClick={handleNext}
          className={`px-6 py-3 rounded-lg text-white 
            ${answered ? "bg-blue-600" : "bg-gray-400 cursor-not-allowed"}
          `}
        >
          {currentIndex + 1 === questions.length ? "Finish Section" : "Next Question"}
        </button>
      </div>
    </div>
  );
}
