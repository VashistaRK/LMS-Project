/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}

export default function QuizModal({ isOpen, onClose, onSave, initialData }: QuizModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([{ questionText: "", options: ["", "", "", ""], correctAnswer: 0 }]);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setQuestions(initialData.questions || []);
    } else {
      setTitle("");
      setDescription("");
      setQuestions([{ questionText: "", options: ["", "", "", ""], correctAnswer: 0 }]);
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleQuestionChange = (index: number, field: string, value: any) => {
    const updated = [...questions];
  if (field === "options") updated[index].options = value;
  else (updated as any)[index][field] = value;
    setQuestions(updated);
  };

  const addQuestion = () => setQuestions([...questions, { questionText: "", options: ["", "", "", ""], correctAnswer: 0 }]);
  const removeQuestion = (i: number) => setQuestions(questions.filter((_, idx) => idx !== i));

  const handleSave = () => {
    if (!title.trim()) return alert("Title required!");
    onSave({ title, description, questions });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-3xl p-6 shadow-lg overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-semibold mb-4">{initialData ? "Edit Quiz" : "Create New Quiz"}</h2>

        <input
          type="text"
          className="w-full border p-2 mb-2 rounded-md"
          placeholder="Quiz Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="w-full border p-2 mb-4 rounded-md"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="space-y-4">
          {questions.map((q, i) => (
            <div key={i} className="border p-3 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-gray-700">Question {i + 1}</h3>
                {questions.length > 1 && (
                  <button
                    onClick={() => removeQuestion(i)}
                    className="text-red-500 text-sm hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
              <input
                type="text"
                placeholder="Question text"
                className="w-full border p-2 mb-2 rounded-md"
                value={q.questionText}
                onChange={(e) => handleQuestionChange(i, "questionText", e.target.value)}
              />
              {q.options.map((opt, idx) => (
                <input
                  key={idx}
                  type="text"
                  placeholder={`Option ${idx + 1}`}
                  className="w-full border p-2 mb-2 rounded-md"
                  value={opt}
                  onChange={(e) => {
                    const newOptions = [...q.options];
                    newOptions[idx] = e.target.value;
                    handleQuestionChange(i, "options", newOptions);
                  }}
                />
              ))}
              <label className="text-sm font-medium">Correct Answer Index (0-3)</label>
              <input
                type="number"
                min="0"
                max="3"
                className="border p-1 ml-2 rounded-md w-16"
                value={q.correctAnswer}
                onChange={(e) => handleQuestionChange(i, "correctAnswer", parseInt(e.target.value))}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-4">
          <button
            onClick={addQuestion}
            className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-md"
          >
            + Add Question
          </button>

          <div className="space-x-2">
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
