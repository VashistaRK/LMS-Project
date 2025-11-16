/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { toast } from "sonner";
import axios from "axios";
import { useEffect, useState } from "react";
import { getQuestions, createQuestion, updateQuestion, deleteQuestion } from "../services/questionApi";
import { Trash2, Edit3, Plus, X, Check } from "lucide-react";

const api = import.meta.env.VITE_API_URL || "http://localhost:3000";

function QuestionBankUploader({ onUploaded }: { onUploaded: () => void }) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const handleUpload = async () => {
    const file = inputRef.current?.files?.[0];
    if (!file) return toast.error("Please select a PDF or DOCX");

    const form = new FormData();
    form.append("doc", file);

    try {
      const res = await axios.post(`${api}/api/questions/upload-doc`, form, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    toast.success(`Added ${res.data.added} questions to Question Bank`);

    if (onUploaded) onUploaded();// refresh table
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="border p-4 rounded-xl bg-white shadow-sm mb-8">
      <h2 className="font-semibold mb-3 text-lg">Upload PDF/DOCX → Add to Question Bank</h2>

      <input type="file" accept=".pdf,.docx" ref={inputRef} />

      <button onClick={handleUpload} className="mt-3">
        Upload & Extract Questions
      </button>
    </div>
  );
}


export default function AdminQuizPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchQuestions = async () => {
    try {
      const res = await getQuestions();
      const arr = Array.isArray(res) ? res : res?.data || [];
      console.log("Fetched questions:", arr);
      const normalized = (arr || []).map((q: any) => ({
        _id: q._id || q.id || q.id?.toString?.() || String(q.id || ''),
        type: q.type || 'mcq',
        questionText: q.questionText || q.question || q.title || '',
        options: q.options || [],
        correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : (q.correctAnswer ?? 0),
        genre: q.genre || 'general',
        meta: q.meta || {},
        __raw: q,
      }));

      setQuestions(normalized);
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
      genre: "general",
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

  const filteredQuestions = questions.filter(q => 
    q.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.genre.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        genre: form.genre,
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
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="rounded-2xl bg-white w-full max-w-2xl shadow-2xl transform transition-all">
          <div className="bg-gradient-to-r from-red-500 to-red-600 px-8 py-6 rounded-t-2xl">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">
                {initial && initial._id ? "Edit Question" : "Create New Question"}
              </h2>
              <button 
                onClick={onClose} 
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="p-8 max-h-[70vh] overflow-y-auto">
            <div className="space-y-6">
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-800">
                  Question Type
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setField("type", e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-red-500 focus:outline-none transition-colors"
                >
                  <option value="mcq">Multiple Choice</option>
                  <option value="text">Free Text</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-800">
                  Genre / Category
                </label>
                <input
                  value={form.genre || ''}
                  onChange={(e) => setField('genre', e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-red-500 focus:outline-none transition-colors"
                  placeholder="e.g. javascript, algebra, grammar"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-800">
                  Question Text
                </label>
                <textarea
                  value={form.questionText}
                  onChange={(e) => setField("questionText", e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-red-500 focus:outline-none transition-colors resize-none"
                  rows={4}
                  placeholder="Enter your question here..."
                />
              </div>

              {form.type === "mcq" && (
                <div>
                  <label className="block mb-3 text-sm font-semibold text-gray-800">
                    Answer Options
                  </label>
                  <div className="space-y-3">
                    {(form.options || []).map((opt: string, i: number) => (
                      <div key={i} className="flex items-center gap-3 group">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-xl border-2 transition-all ${
                          form.correctAnswer === i 
                            ? 'bg-red-500 border-red-500' 
                            : 'border-gray-200 hover:border-red-300'
                        }`}>
                          <input
                            type="radio"
                            name="correctOption"
                            checked={form.correctAnswer === i}
                            onChange={() => setField("correctAnswer", i)}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => setField("correctAnswer", i)}
                            className="w-full h-full flex items-center justify-center"
                          >
                            {form.correctAnswer === i && <Check size={20} className="text-white" />}
                          </button>
                        </div>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => updateOption(i, e.target.value)}
                          className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-red-500 focus:outline-none transition-colors"
                          placeholder={`Option ${i + 1}`}
                        />
                        {form.options.length > 2 && (
                          <button 
                            onClick={() => removeOption(i)} 
                            className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          >
                            <Trash2 size={20} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={addOption} 
                    className="mt-4 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-2"
                  >
                    <Plus size={18} /> Add Option
                  </button>
                </div>
              )}

              {form.type === "text" && (
                <div className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-200">
                  <p className="text-gray-600 text-center">
                    Students will provide a free-text answer for this question
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 px-8 py-6 bg-gray-50 rounded-b-2xl border-t">
            <button 
              onClick={onClose} 
              className="px-6 py-3 rounded-xl border-2 border-gray-300 font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={submit} 
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-lg shadow-red-500/30"
            >
              Save Question
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Question Bank</h1>
              <p className="text-gray-600">Manage your quiz questions and categories</p>
            </div>
            <button
              onClick={openNew}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-semibold shadow-lg shadow-red-500/30 flex items-center gap-2 justify-center"
            >
              <Plus size={20} />
              Add Question
            </button>
          </div>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search questions or genres..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-96 px-6 py-4 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:outline-none transition-colors shadow-sm"
          />
        </div>
        <div className="mb-6">
          <QuestionBankUploader onUploaded={fetchQuestions} />
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-red-500 to-red-600 text-white">
                  <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Genre</th>
                  <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Question</th>
                  <th className="px-6 py-4 text-center text-sm font-bold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredQuestions.map((q: any, idx: number) => (
                  <tr key={q._id} className={`hover:bg-red-50/50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <td className="px-6 py-4 text-sm font-mono text-gray-600">{q._id}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        q.type === 'mcq' 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {q.type === 'mcq' ? 'MCQ' : 'Text'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                        {q.genre}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-md">
                      <div className="line-clamp-2">{q.questionText}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => { setEditData(q); setModalOpen(true); }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(q._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredQuestions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="text-gray-400">
                        <p className="text-lg font-semibold mb-2">No questions found</p>
                        <p className="text-sm">Add your first question to get started</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredQuestions.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{filteredQuestions.length}</span> of <span className="font-semibold text-gray-900">{questions.length}</span> questions
              </p>
            </div>
          )}
        </div>
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