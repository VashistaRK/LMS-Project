/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { toast } from "sonner";
import axios from "axios";
import { useEffect, useState } from "react";
import { getQuestions, createQuestion, updateQuestion, deleteQuestion } from "../services/questionApi";
import { Trash2, Edit3, Plus, X, Check, Upload, Code, FileText, Search } from "lucide-react";
import {
  getCodingQuestions,
  createCodingQuestion,
  updateCodingQuestion,
  deleteCodingQuestion
} from "../services/codingQuestionsApi.ts";

const api = import.meta.env.VITE_API_URL;

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
      alert("Added Questions to Question Bank Sucessfully✅");
      toast.success(`Added ${res.data.added} questions to Question Bank`);
      if (onUploaded) onUploaded();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-8 hover:border-red-400 transition-colors">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="bg-red-50 p-4 rounded-full">
          <Upload className="w-8 h-8 text-red-600" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Upload Question Document</h3>
          <p className="text-sm text-gray-500">Upload PDF or DOCX to auto-extract questions</p>
        </div>
        <input
          type="file"
          accept=".pdf,.docx"
          ref={inputRef}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 cursor-pointer"
        />
        <button
          onClick={handleUpload}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Upload size={18} />
          Upload & Extract
        </button>
      </div>
    </div>
  );
}

const CodingQuestionModal = ({ isOpen, initial, onClose, onSave }: any) => {
  const emptyForm = {
    title: "",
    description: "",
    examples: [""],
    constraints: "",
    starterCode: "",
    functionName: "",
    difficulty: "Easy",
    hints: [""],
    tags: [],
    testCases: [{ input: [""], output: "" }],
  };

  const [form, setForm] = useState(initial || emptyForm);

  useEffect(() => {
    if (initial) {
      setForm({
        ...emptyForm,
        ...initial,
        examples: initial.examples ?? [""],
        constraints: initial.constraints ?? "",
        starterCode: initial.starterCode ?? "",
        hints: initial.hints ?? [""],
        tags: initial.tags ?? [],
        testCases: initial.testCases ?? [{ input: [""], output: "" }],
      });
    } else {
      setForm(emptyForm);
    }
  }, [initial]);

  if (!isOpen) return null;

  const updateTestCase = (index: number, key: string, value: any) => {
    const copy = [...form.testCases];
    copy[index][key] = value;
    setForm({ ...form, testCases: copy });
  };

  const addTestCase = () =>
    setForm({ ...form, testCases: [...form.testCases, { input: [""], output: "" }] });

  const removeTestCase = (index: number) => {
    const copy = [...form.testCases];
    copy.splice(index, 1);
    setForm({ ...form, testCases: copy });
  };

  const updateArrayField = (key: string, index: number, value: string) => {
    const copy = [...form[key]];
    copy[index] = value;
    setForm({ ...form, [key]: copy });
  };

  const addArrayItem = (key: string) => {
    setForm({ ...form, [key]: [...form[key], ""] });
  };

  const removeArrayItem = (key: string, index: number) => {
    const copy = [...form[key]];
    copy.splice(index, 1);
    setForm({ ...form, [key]: copy });
  };

  const submit = () => {
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Code size={28} />
              {initial ? "Edit Coding Question" : "Create Coding Question"}
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-8 max-h-[75vh] overflow-y-auto">
          <div className="space-y-6">
            {/* Title & Difficulty Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Question Title *
                </label>
                <input
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-red-500 focus:outline-none transition-colors"
                  placeholder="e.g., Two Sum Problem"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Difficulty Level *
                </label>
                <select
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-red-500 focus:outline-none transition-colors"
                  value={form.difficulty}
                  onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Problem Description *
              </label>
              <textarea
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-red-500 focus:outline-none transition-colors resize-none"
                placeholder="Describe the problem statement in detail..."
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            {/* Examples */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Examples</h3>
              <div className="space-y-3">
                {form.examples.map((ex: any, idx: number) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      className="flex-1 border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-red-500 focus:outline-none transition-colors"
                      placeholder={`Example ${idx + 1}: Input → Output`}
                      value={ex}
                      onChange={(e) => updateArrayField("examples", idx, e.target.value)}
                    />
                    {form.examples.length > 1 && (
                      <button
                        className="text-red-600 hover:bg-red-50 px-3 rounded-lg transition-colors"
                        onClick={() => removeArrayItem("examples", idx)}
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  className="text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-2"
                  onClick={() => addArrayItem("examples")}
                >
                  <Plus size={18} /> Add Example
                </button>
              </div>
            </div>

            {/* Constraints */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Constraints
              </label>
              <textarea
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-red-500 focus:outline-none transition-colors resize-none"
                placeholder="e.g., 1 ≤ array.length ≤ 10^4"
                rows={3}
                value={form.constraints}
                onChange={(e) => setForm({ ...form, constraints: e.target.value })}
              />
            </div>

            {/* Function Name & Starter Code */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Function Name
                </label>
                <input
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-red-500 focus:outline-none transition-colors font-mono"
                  placeholder="e.g., twoSum"
                  value={form.functionName}
                  onChange={(e) => setForm({ ...form, functionName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tags
                </label>
                <input
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-red-500 focus:outline-none transition-colors"
                  placeholder="array, hash-table, two-pointers"
                  value={form.tags.join(", ")}
                  onChange={(e) => setForm({ ...form, tags: e.target.value.split(",").map((t) => t.trim()) })}
                />
              </div>
            </div>

            {/* Starter Code */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Starter Code Template
              </label>
              <textarea
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-red-500 focus:outline-none transition-colors resize-none font-mono text-sm"
                placeholder="function twoSum(nums, target) {&#10;  // Your code here&#10;}"
                rows={6}
                value={form.starterCode}
                onChange={(e) => setForm({ ...form, starterCode: e.target.value })}
              />
            </div>

            {/* Hints */}
            <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Hints (Optional)</h3>
              <div className="space-y-3">
                {form.hints.map((hint: any, idx: number) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      className="flex-1 border-2 border-amber-200 rounded-lg px-4 py-2 focus:border-amber-400 focus:outline-none transition-colors bg-white"
                      placeholder={`Hint ${idx + 1}`}
                      value={hint}
                      onChange={(e) => updateArrayField("hints", idx, e.target.value)}
                    />
                    {form.hints.length > 1 && (
                      <button
                        className="text-red-600 hover:bg-red-50 px-3 rounded-lg transition-colors"
                        onClick={() => removeArrayItem("hints", idx)}
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  className="text-amber-700 hover:bg-amber-100 px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-2"
                  onClick={() => addArrayItem("hints")}
                >
                  <Plus size={18} /> Add Hint
                </button>
              </div>
            </div>

            {/* Test Cases */}
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Cases *</h3>
              <div className="space-y-4">
                {form.testCases.map((t: any, idx: number) => (
                  <div key={idx} className="bg-white rounded-lg p-4 border-2 border-green-200">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-semibold text-gray-700">Test Case {idx + 1}</span>
                      {form.testCases.length > 1 && (
                        <button
                          className="text-red-600 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors text-sm"
                          onClick={() => removeTestCase(idx)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="space-y-2">
                      <input
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-green-500 focus:outline-none transition-colors font-mono text-sm"
                        placeholder='Input (JSON array): [2, 7, 11, 15]'
                        value={JSON.stringify(t.input)}
                        onChange={(e) => {
                          try {
                            updateTestCase(idx, "input", JSON.parse(e.target.value));
                          } catch { }
                        }}
                      />
                      <input
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-green-500 focus:outline-none transition-colors font-mono text-sm"
                        placeholder='Expected Output: [0, 1]'
                        value={JSON.stringify(t.output)}
                        onChange={(e) => {
                          try {
                            updateTestCase(idx, "output", JSON.parse(e.target.value));
                          } catch { }
                        }}
                      />
                    </div>
                  </div>
                ))}
                <button
                  className="text-green-700 hover:bg-green-100 px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-2"
                  onClick={addTestCase}
                >
                  <Plus size={18} /> Add Test Case
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-8 py-6 bg-gray-50 border-t">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl border-2 border-gray-300 font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold hover:from-red-700 hover:to-red-800 transition-all shadow-lg"
          >
            Save Question
          </button>
        </div>
      </div>
    </div>
  );
};

export default function AdminQuizPage() {
  const [activeTab, setActiveTab] = useState<'mcq' | 'coding'>('mcq');
  const [questions, setQuestions] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [codingQuestions, setCodingQuestions] = useState<any[]>([]);
  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const [editCodeData, setEditCodeData] = useState<any | null>(null);

  const normalizeArray = (res: any) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res?.data?.data)) return res.data.data;
    if (Array.isArray(res?.notifications)) return res.notifications;
    return [];
  };

  const fetchQuestions = async () => {
    try {
      const res = await getQuestions();
      const arr = normalizeArray(res);
      const normalized = arr.map((q: any) => ({
        _id: q._id || q.id || String(q.id),
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

  const fetchCodingQuestions = async () => {
    try {
      const res = await getCodingQuestions();
      setCodingQuestions(res);
    } catch (err) {
      console.error("Failed to load coding questions:", err);
    }
  };

  useEffect(() => {
    fetchQuestions();
    fetchCodingQuestions();
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

  const filteredCodingQuestions = codingQuestions.filter(q =>
    q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
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
        <div className="rounded-2xl bg-white w-full max-w-3xl shadow-2xl">
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-6 rounded-t-2xl">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <FileText size={28} />
                {initial && initial._id ? "Edit MCQ Question" : "Create MCQ Question"}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700">
                    Question Type *
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
                  <label className="block mb-2 text-sm font-semibold text-gray-700">
                    Genre / Category *
                  </label>
                  <input
                    value={form.genre || ''}
                    onChange={(e) => setField('genre', e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-red-500 focus:outline-none transition-colors"
                    placeholder="e.g., JavaScript, Math, Science"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">
                  Question Text *
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
                  <label className="block mb-3 text-sm font-semibold text-gray-700">
                    Answer Options *
                  </label>
                  <div className="space-y-3">
                    {(form.options || []).map((opt: string, i: number) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-xl border-2 transition-all cursor-pointer ${form.correctAnswer === i
                          ? 'bg-red-600 border-red-600'
                          : 'border-gray-200 hover:border-red-300'
                          }`}>
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
                            className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
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
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold hover:from-red-700 hover:to-red-800 transition-all shadow-lg"
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Question Bank Manager</h1>
          <p className="text-gray-600">Create and manage MCQ and coding assessment questions</p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex gap-2 bg-white p-1.5 rounded-xl shadow-sm border border-gray-200 w-fit">
            <button
              onClick={() => setActiveTab('mcq')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'mcq'
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              <FileText size={20} />
              MCQ Questions
            </button>
            <button
              onClick={() => setActiveTab('coding')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'coding'
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              <Code size={20} />
              Coding Questions
            </button>
          </div>
        </div>

        {/* Search & Add Button */}
        <div className="mb-6 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:outline-none transition-colors bg-white shadow-sm"
            />
          </div>
          <button
            onClick={() => {
              if (activeTab === 'mcq') {
                openNew();
              } else {
                setEditCodeData(null);
                setCodeModalOpen(true);
              }
            }}
            className={`px-6 py-3.5 rounded-xl text-white font-semibold transition-all shadow-lg flex items-center gap-2 justify-center
              bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
            }`}
          >
            <Plus size={20} />
            Add {activeTab === 'mcq' ? 'MCQ' : 'Coding'} Question
          </button>
        </div>

        {/* MCQ Tab Content */}
        {activeTab === 'mcq' && (
          <>
            <div className="mb-6">
              <QuestionBankUploader onUploaded={fetchQuestions} />
            </div>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-red-600 to-red-700 text-white">
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">ID</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Type</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Genre</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Question</th>
                      <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredQuestions.map((q: any, idx: number) => (
                      <tr key={q._id} className={`hover:bg-red-50/50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                        <td className="px-6 py-4 text-sm font-mono text-gray-600">{q._id.slice(0, 8)}...</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold 
                              bg-red-100 text-gray-700'
                          }`}>
                            {q.type === 'mcq' ? 'Multiple Choice' : 'Free Text'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
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
                            <FileText className="mx-auto mb-3 text-gray-300" size={48} />
                            <p className="text-lg font-semibold mb-2">No MCQ questions found</p>
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
          </>
        )}

        {/* Coding Tab Content */}
        {activeTab === 'coding' && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-red-600 to-red-700 text-white">
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Title</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Difficulty</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Tags</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Function</th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCodingQuestions.map((q: any, idx: number) => (
                    <tr key={q._id} className={`hover:bg-red-50/50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{q.title}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${q.difficulty === 'Easy'
                          ? 'bg-green-100 text-green-700'
                          : q.difficulty === 'Medium'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                          }`}>
                          {q.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {q.tags?.slice(0, 3).map((tag: string, i: number) => (
                            <span key={i} className="inline-flex px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-700">
                              {tag}
                            </span>
                          ))}
                          {q.tags?.length > 3 && (
                            <span className="inline-flex px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                              +{q.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-700">
                          {q.functionName || 'N/A'}
                        </code>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => { setEditCodeData(q); setCodeModalOpen(true); }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit3 size={18} />
                          </button>
                          <button
                            onClick={async () => {
                              if (window.confirm("Are you sure you want to delete this coding question?")) {
                                await deleteCodingQuestion(q._id);
                                fetchCodingQuestions();
                              }
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredCodingQuestions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="text-gray-400">
                          <Code className="mx-auto mb-3 text-gray-300" size={48} />
                          <p className="text-lg font-semibold mb-2">No coding questions found</p>
                          <p className="text-sm">Add your first coding challenge to get started</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {filteredCodingQuestions.length > 0 && (
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-semibold text-gray-900">{filteredCodingQuestions.length}</span> of <span className="font-semibold text-gray-900">{codingQuestions.length}</span> questions
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <QuestionModal
        isOpen={modalOpen}
        initial={editData}
        onClose={() => { setModalOpen(false); setEditData(null); }}
        onSave={handleSave}
      />

      <CodingQuestionModal
        isOpen={codeModalOpen}
        initial={editCodeData}
        onClose={() => setCodeModalOpen(false)}
        onSave={async (data: any) => {
          if (editCodeData?._id) {
            await updateCodingQuestion(editCodeData._id, data);
          } else {
            await createCodingQuestion(data);
          }
          setCodeModalOpen(false);
          fetchCodingQuestions();
        }}
      />
    </div>
  );
}