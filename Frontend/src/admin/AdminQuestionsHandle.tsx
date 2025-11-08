/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { getQuestions, createQuestion, updateQuestion, deleteQuestion } from "../services/questionApi";

export default function AdminQuizPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const fetchQuestions = async () => {
    try {
      const res = await getQuestions();
      setQuestions(Array.isArray(res) ? res : res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const openNew = () => {
    setEditData({
      type: "mcq",
      questionText: "",
      options: ["", ""],
      correctAnswer: 0,
      genre: "general", // <-- added
      meta: {},
    });
    setModalOpen(true);
  };

  const handleSave = async (data: any) => {
    try {
      if (editData && editData._id) {
        await updateQuestion(editData._id, data);
      } else {
        await createQuestion(data);
      }
      setModalOpen(false);
      setEditData(null);
      fetchQuestions();
    } catch (err) {
      console.error(err);
      alert('Save failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      await deleteQuestion(id);
      fetchQuestions();
    }
  };

  // Inline modal form (type-driven inputs)
  const QuestionModal = ({ isOpen, initial, onClose, onSave }: any) => {
    const [form, setForm] = useState<any>(initial || { type: "mcq", questionText: "", options: [""], correctAnswer: 0, genre: "general" });

    useEffect(() => setForm(initial || { type: "mcq", questionText: "", options: [""], correctAnswer: 0, genre: "general" }), [initial]);

    if (!isOpen) return null;

    const setField = (k: string, v: any) => setForm((s: any) => ({ ...s, [k]: v }));

    const updateOption = (idx: number, val: string) => {
      const opts = [...(form.options || [])];
      opts[idx] = val;
      setField("options", opts);
    };

    const addOption = () => setField("options", [...(form.options || []), ""]);
    const removeOption = (idx: number) => {
      const opts = [...(form.options || [])];
      opts.splice(idx, 1);
      let ca = form.correctAnswer;
      if (ca >= opts.length) ca = Math.max(0, opts.length - 1);
      setForm({ ...form, options: opts, correctAnswer: ca });
    };

    const submit = () => {
      const payload: any = {
        type: form.type,
        questionText: form.questionText,
        genre: form.genre, // <-- include genre
        meta: form.meta || {},
      };
      if (form.type === "mcq") {
        payload.options = form.options || [];
        payload.correctAnswer = typeof form.correctAnswer === "number" ? form.correctAnswer : 0;
      } else {
        payload.options = [];
        payload.correctAnswer = null;
      }
      onSave(payload);
    };

    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="rounded-lg w-[90%] max-w-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">{initial && initial._id ? "Edit Question" : "New Question"}</h2>
            <button onClick={onClose} className="text-gray-600">Close</button>
          </div>

          <label className="block mb-2">
            <span className="text-sm font-medium">Type</span>
            <select
              value={form.type}
              onChange={(e) => setField("type", e.target.value)}
              className="mt-1 block w-full border rounded px-2 py-1"
            >
              <option value="mcq">MCQ</option>
              <option value="text">Text</option>
            </select>
          </label>

          <label className="block mb-2">
            <span className="text-sm font-medium">Genre</span>
            <input
              value={form.genre || ''}
              onChange={(e) => setField('genre', e.target.value)}
              className="mt-1 block w-full border rounded px-2 py-1"
              placeholder="e.g. javascript, algebra, grammar"
            />
          </label>

          <label className="block mb-4">
            <span className="text-sm font-medium">Question</span>
            <textarea
              value={form.questionText}
              onChange={(e) => setField("questionText", e.target.value)}
              className="mt-1 block w-full border rounded px-2 py-1"
              rows={3}
            />
          </label>

          {form.type === "mcq" && (
            <div className="mb-4">
              <span className="text-sm font-medium block mb-2">Options</span>
              {(form.options || []).map((opt: string, i: number) => (
                <div key={i} className="flex items-center gap-2 mb-2">
                  <input
                    type="radio"
                    name="correctOption"
                    checked={form.correctAnswer === i}
                    onChange={() => setField("correctAnswer", i)}
                    className="mr-2"
                  />
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => updateOption(i, e.target.value)}
                    className="flex-1 border rounded px-2 py-1"
                    placeholder={`Option ${i + 1}`}
                  />
                  <button onClick={() => removeOption(i)} className="text-red-600 px-2">Remove</button>
                </div>
              ))}
              <div className="flex gap-2">
                <button onClick={addOption} className="bg-gray-200 px-3 py-1 rounded">+ Add option</button>
              </div>
            </div>
          )}

          {form.type === "text" && (
            <div className="mb-4">
              <span className="text-sm font-medium block mb-2">Student answer: free text (no options)</span>
              <input type="text" disabled placeholder="Students will answer in text" className="w-full border rounded px-2 py-1 bg-gray-50" />
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 rounded border">Cancel</button>
            <button onClick={submit} className="px-4 py-2 rounded bg-blue-600 text-white">Save</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Question Management</h1>
        <button
          onClick={openNew}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          + Add Question
        </button>
      </div>

      <div className="bg-white rounded shadow p-4">
        <table className="w-full table-auto">
          <thead>
            <tr className="text-left">
              <th className="px-2 py-2">ID</th>
              <th className="px-2 py-2">Type</th>
              <th className="px-2 py-2">Question</th>
              <th className="px-2 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q: any) => (
              <tr key={q._id} className="border-t">
                <td className="px-2 py-2 text-sm">{q._id}</td>
                <td className="px-2 py-2 text-sm">{q.type}</td>
                <td className="px-2 py-2 text-sm">{q.questionText}</td>
                <td className="px-2 py-2 text-sm">
                  <button
                    onClick={() => { setEditData(q); setModalOpen(true); }}
                    className="text-blue-600 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(q._id)}
                    className="text-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {questions.length === 0 && (
              <tr>
                <td colSpan={4} className="px-2 py-4 text-center text-sm text-gray-500">No questions found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <QuestionModal
        isOpen={modalOpen}
        initial={editData}
        onClose={() => { setModalOpen(false); setEditData(null); }}
        onSave={handleSave}
      />
    </div>
  );
}
