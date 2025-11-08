import React, { useState } from "react";
import { Award, CheckCircle2, XCircle } from "lucide-react";

interface Question {
  question: string;
  options: string[];
  correct: string;
  answer?: string;
}

interface QuizModalProps {
  questions: Question[];
  onClose: () => void;
  onSubmit: (score: number) => void;
}

const QuizModal: React.FC<QuizModalProps> = ({ questions, onClose, onSubmit }) => {
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleChange = (qIndex: number, option: string) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: option }));
  };

  const handleSubmit = () => {
    let calculatedScore = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correct) {
        calculatedScore++;
      }
    });
    setScore(calculatedScore);
    setSubmitted(true);
    onSubmit(calculatedScore);
  };

  const getScoreColor = () => {
    if (!questions.length) return "text-gray-600";
    const percent = (score / questions.length) * 100;
    if (percent >= 80) return "text-green-600";
    if (percent >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreMessage = (): string => {
    if (!questions.length) return "No questions available.";
    const percent = (score / questions.length) * 100;
    if (percent >= 80) return "Excellent! You aced it!";
    if (percent >= 50) return "Good job! Keep improving!";
    return "Keep practicing, you'll get better!";
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Award className="w-7 h-7" />
            Chapter Quiz
          </h2>
          <p className="text-blue-100 mt-1 text-sm">
            {submitted
              ? `You scored ${score} out of ${questions.length}`
              : `${questions.length} questions • Select the best answer`
            }
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          {questions.map((q, i) => {
            const isCorrect = submitted && answers[i] === q.correct;

            return (
              <div
                key={i}
                className={`p-5 rounded-xl border-2 transition-all ${
                  submitted
                    ? isCorrect
                      ? 'bg-green-50 border-green-300'
                      : 'bg-red-50 border-red-300'
                    : 'bg-gray-50 border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-start gap-3 mb-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                    {i + 1}
                  </span>
                  <p className="font-semibold text-gray-800 text-lg leading-relaxed pt-1">
                    {q.question}
                  </p>
                </div>

                <div className="ml-11 space-y-3">
                  {q.options.map((opt, optIndex) => {
                    const isSelected = answers[i] === opt;
                    const isCorrectAnswer = submitted && opt === q.correct;
                    const isWrongAnswer = submitted && isSelected && opt !== q.correct;

                    return (
                      <label
                        key={`${i}-${optIndex}`}
                        className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          submitted
                            ? isCorrectAnswer
                              ? 'bg-green-100 border-green-400'
                              : isWrongAnswer
                                ? 'bg-red-100 border-red-400'
                                : 'bg-white border-gray-200'
                            : isSelected
                              ? 'bg-blue-50 border-blue-400 shadow-sm'
                              : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                        } ${submitted ? 'cursor-default' : ''}`}
                      >
                        <input
                          type="radio"
                          name={`question-${i}`}
                          value={opt}
                          disabled={submitted}
                          checked={isSelected}
                          onChange={() => handleChange(i, opt)}
                          className="w-5 h-5 text-blue-600 focus:ring-2 focus:ring-blue-500"
                        />
                        <span className={`flex-1 ${submitted && isCorrectAnswer ? 'font-semibold' : ''}`}>
                          {opt}
                        </span>
                        {submitted && isCorrectAnswer && (
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                        )}
                        {submitted && isWrongAnswer && (
                          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-gray-200 px-8 py-6 bg-gray-50">
          {!submitted ? (
            <button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length !== questions.length}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:from-gray-400 disabled:to-gray-500 transition-all transform hover:scale-105 active:scale-95"
            >
              {Object.keys(answers).length === questions.length
                ? 'Submit Quiz'
                : `Answer ${questions.length - Object.keys(answers).length} more`
              }
            </button>
          ) : (
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-6 border-2 border-gray-200 text-center">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Award className={`w-8 h-8 ${getScoreColor()}`} />
                  <p className={`text-3xl font-bold ${getScoreColor()}`}>
                    {score} / {questions.length}
                  </p>
                </div>
                <p className="text-gray-600 font-medium mt-2">
                  {getScoreMessage()}
                </p>
                <div className="mt-4 bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${(score / questions.length) * 100}%` }}
                  />
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-full px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95"
              >
                Close Quiz
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizModal;
