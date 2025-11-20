/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  listTracks,
  createTrack,
  updateTrack,
  deleteTrack as apiDeleteTrack,
  createTest,
  updateTest,
  deleteTest as apiDeleteTest,
  listTestsForTrack,
  getTest,
} from "@/services/assessmentApi";

import { getCodingQuestions } from "@/services/codingQuestionsApi";
import { getGenres, getQuestions } from "@/services/questionApi";

import { useEffect, useMemo, useState } from "react";

const resolveQuestionId = (question: any): string =>
  question?._id ??
  question?.id ??
  question?.questionId ??
  question?.question_id ??
  (typeof question === "string" ? question : "");

const extractQuestionIds = (testData: any): string[] => {
  if (!testData) return [];

  const collected = new Set<string>();

  const addIds = (ids?: any[]) => {
    if (!Array.isArray(ids)) return;
    ids.forEach((raw) => {
      const id = resolveQuestionId(raw);
      if (id) collected.add(String(id));
    });
  };

  addIds(testData.questionIds);
  if (Array.isArray(testData.sections)) {
    testData.sections.forEach((section: any) => addIds(section?.questionIds));
  }
  if (Array.isArray(testData.questions)) {
    addIds(testData.questions);
  }

  return Array.from(collected);
};

const AdminAssessments = () => {
  const [tracks, setTracks] = useState<any[]>([]);

  // NEW STATES
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [codingQuestions, setCodingQuestions] = useState<any[]>([]);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    type: ["MCQ", "Coding", "Mixed"][0] || "",
  });

  const [editingSlug, setEditingSlug] = useState<string | null>(null);

  // Tests
  const [selectedTrack, setSelectedTrack] = useState<string>("");
  const [tests, setTests] = useState<any[]>([]);
  const [testForm, setTestForm] = useState({
    testId: "",
    title: "",
    type: "MCQ",
    durationSec: 600,
    questionIds: [] as string[],
  });
  const [editingTest, setEditingTest] = useState<{
    trackSlug: string;
    testId: string;
  } | null>(null);

  //Genre
  const [genres, setGenres] = useState<string[]>([]);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [genreQuestions, setGenreQuestions] = useState<any[]>([]);

  const questionBankIndex = useMemo(() => {
    const map = new Map<string, any>();
    const addToMap = (arr: any[], source?: string) => {
      if (!Array.isArray(arr)) return;
      arr.forEach((item) => {
        const id = resolveQuestionId(item);
        if (!id || map.has(id)) return;
        map.set(id, { ...item, _id: id, __source: source });
      });
    };

    addToMap(quizQuestions, "mcq");
    addToMap(codingQuestions, "coding");
    addToMap(genreQuestions, "genre");

    return map;
  }, [quizQuestions, codingQuestions, genreQuestions]);

  /* -----------------------------
       FETCH TRACKS
    ------------------------------ */
  const fetchTracks = async () => {
    try {
      const data = await listTracks();
      setTracks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching tracks:", error);
      setTracks([]);
    }
  };

  /* -----------------------------
       FETCH QUIZ QUESTIONS
    ------------------------------ */
  const fetchQuizQuestions = async () => {
    try {
      const res = await getQuestions();
      const arr = (Array.isArray(res) ? res : []) as any[];
      const normalized = arr
        .map((q) => {
          const id = resolveQuestionId(q);
          if (!id) return null;
          return { ...q, _id: id };
        })
        .filter(Boolean);
      setQuizQuestions(normalized as any[]);
    } catch (err) {
      console.error("Error loading quiz questions:", err);
      setQuizQuestions([]);
    }
  };

  /* -----------------------------
       FETCH CODING QUESTIONS
    ------------------------------ */
  const fetchCodingQuestions = async () => {
    try {
      const res = await getCodingQuestions();
      const arr = (Array.isArray(res) ? res : []) as any[];
      const normalized = arr
        .map((q) => {
          const id = resolveQuestionId(q);
          if (!id) return null;
          return { ...q, _id: id };
        })
        .filter(Boolean);
      setCodingQuestions(normalized as any[]);
    } catch (err) {
      console.error("Error loading coding questions:", err);
      setCodingQuestions([]);
    }
  };

  const loadGenres = async () => {
    try {
      const res = await getGenres();
      setGenres(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("Error loading genres:", err);
    }
  };

  /* -----------------------------
       LOAD ALL DATA ONCE
    ------------------------------ */
  useEffect(() => {
    fetchTracks();
    fetchQuizQuestions();
    fetchCodingQuestions();
    loadGenres();
  }, []);

  /* -----------------------------
       Test fetching when track selected
    ------------------------------ */
  const fetchTestsForTrack = async (slug: string) => {
    if (!slug) {
      setTests([]);
      return;
    }
    try {
      const res = await listTestsForTrack(slug);
      setTests(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("Error fetching tests:", err);
      setTests([]);
    }
  };

  useEffect(() => {
    if (selectedTrack) fetchTestsForTrack(selectedTrack);
    else setTests([]);
  }, [selectedTrack]);

  /*-----------------------------
       FILTER QUESTIONS BASED ON TYPE
    ------------------------------*/

  const loadQuestionsByGenre = async (genre: string) => {
    setSelectedGenre(genre);

    if (!genre) {
      setGenreQuestions([]);
      return;
    }

    try {
      const res = await getQuestions(genre); // you may need to adjust API
      const arr = (Array.isArray(res) ? res : res?.data ?? []) as any[];
      const normalized = arr
        .map((q) => {
          const id = resolveQuestionId(q);
          if (!id) return null;
          return { ...q, _id: id };
        })
        .filter(Boolean);
      setGenreQuestions(normalized as any[]);
    } catch (err) {
      console.error("Error loading questions by genre:", err);
      setGenreQuestions([]);
    }
  };

  /* -----------------------------
       CREATE or UPDATE TRACK
    ------------------------------ */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingSlug) {
        // UPDATE (PATCH)
        await updateTrack(editingSlug, form);
      } else {
        // CREATE
        await createTrack(form);
      }

      setForm({ title: "", slug: "", description: "", type: "" });
      setEditingSlug(null);

      fetchTracks();
    } catch (error) {
      console.error("Error saving track:", error);
    }
  };

  /* -----------------------------
       DELETE TRACK
    ------------------------------ */
  const deleteTrack = async (slug: string) => {
    if (!confirm("Delete this track?")) return;

    try {
      await apiDeleteTrack(slug);
      // if the deleted track was selected for tests, clear it
      if (selectedTrack === slug) {
        setSelectedTrack("");
        setTests([]);
      }
      fetchTracks();
    } catch (error) {
      console.error("Error deleting track:", error);
    }
  };

  /* -----------------------------
       START EDIT TRACK
    ------------------------------ */
  const startEdit = (track: any) => {
    setEditingSlug(track.slug);
    setForm({
      title: track.title,
      slug: track.slug,
      description: track.description || "",
      type: track.type || "",
    });
  };

  /* -----------------------------
       CREATE / UPDATE TEST
    ------------------------------ */
  const handleTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrack) {
      alert("Select a track first");
      return;
    }

    const normalizedQuestionIds = testForm.questionIds
      .map((q: any) => (typeof q === "string" ? q : resolveQuestionId(q)))
      .filter((id): id is string => Boolean(id))
      .map(String);

    const payload = {
      ...testForm,
      questionIds: normalizedQuestionIds,
    };

    try {
      if (editingTest) {
        await updateTest(selectedTrack, editingTest.testId, payload);
      } else {
        await createTest({
          trackSlug: selectedTrack,
          ...payload,
        });
      }

      setTestForm({
        testId: "",
        title: "",
        type: "MCQ",
        durationSec: 600,
        questionIds: [],
      });
      setEditingTest(null);

      fetchTestsForTrack(selectedTrack);
    } catch (err) {
      console.error("Error saving test:", err);
    }
  };

  const startTestEdit = async (t: any) => {
    const trackSlug = selectedTrack || t.trackSlug;
    if (!trackSlug) {
      alert("Select a track before editing a test.");
      return;
    }

    setEditingTest({ trackSlug, testId: t.testId });
    setTestForm({
      testId: t.testId,
      title: t.title,
      type: t.type || "MCQ",
      durationSec: t.durationSec || 600,
      questionIds: Array.isArray(t.questionIds) ? t.questionIds : [],
    });

    try {
      const detail = await getTest(trackSlug, t.testId);
      const ids = extractQuestionIds(detail);
      if (ids.length) {
        setTestForm((prev) => ({
          ...prev,
          questionIds: ids,
        }));
      }
    } catch (err) {
      console.error("Failed to load test details:", err);
    }
  };

  const getQuestionLabel = (id: string) => {
    const entry = questionBankIndex.get(id);
    if (entry) {
      const prefix =
        entry.__source === "coding"
          ? "Coding"
          : entry.__source === "mcq" || entry.type === "MCQ"
          ? "MCQ"
          : "Question";

      const label = entry.questionText || entry.question || entry.title || id;
      return `${prefix}: ${label}`;
    }

    return id;
  };

  const handleDeleteTest = async (trackSlug: string, testId: string) => {
    if (!confirm("Delete this test?")) return;
    try {
      await apiDeleteTest(trackSlug, testId);
      fetchTestsForTrack(trackSlug);
    } catch (err) {
      console.error("Error deleting test:", err);
    }
  };

  return (
    <div className="bg-red-50 p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold">Admin Assessments</h1>

      {/* SHOWING LOADED QUESTIONS */}
      <div className="mt-4 bg-white shadow p-4 rounded">
        <h2 className="font-semibold text-lg">Loaded Question Stats</h2>
        <p>Quiz Questions Loaded: {(quizQuestions || []).length}</p>
        <p>Coding Questions Loaded: {(codingQuestions || []).length}</p>
      </div>

      {/* CREATE/EDIT FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded-lg shadow mt-6 space-y-3"
      >
        <h2 className="text-xl font-semibold">
          {editingSlug ? "Edit Track" : "Create Track"}
        </h2>

        <input
          className="border p-2 w-full rounded"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />

        <input
          className="border p-2 w-full rounded"
          placeholder="Slug"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          required
          disabled={!!editingSlug}
        />

        <textarea
          className="border p-2 w-full rounded"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <input
          className="border p-2 w-full rounded"
          placeholder="Type (optional)"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        />

        <button
          type="submit"
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          {editingSlug ? "Update Track" : "Create Track"}
        </button>

        {editingSlug && (
          <button
            type="button"
            onClick={() => {
              setEditingSlug(null);
              setForm({ title: "", slug: "", description: "", type: "" });
            }}
            className="ml-2 bg-gray-400 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
        )}
      </form>

      {/* TRACK LIST */}
      <ul className="mt-10 bg-red-100 p-4 rounded-lg">
        {tracks.map((track) => (
          <li key={track.slug} className="p-3 border m-4 bg-red-50 rounded">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h2 className="font-bold">{track.title}</h2>
                <p className="text-sm">{track.description}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedTrack(track.slug);
                    fetchTestsForTrack(track.slug);
                  }}
                  className="bg-green-500 text-white px-3 py-1 rounded"
                >
                  Manage Tests
                </button>

                <button
                  onClick={() => startEdit(track)}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteTrack(track.slug)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* ========== TEST MANAGEMENT ========== */}
      <div className="mt-8 bg-white p-5 rounded shadow">
        <h2 className="text-xl font-bold">Manage Tests</h2>

        <div className="mt-3">
          <label className="block text-sm font-medium">Selected Track</label>
          <select
            className="border p-2 mt-1 rounded w-full"
            value={selectedTrack}
            onChange={(e) => setSelectedTrack(e.target.value)}
          >
            <option value="">Select Track</option>
            {tracks.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.title}
              </option>
            ))}
          </select>
        </div>

        {selectedTrack ? (
          <>
            <form
              onSubmit={handleTestSubmit}
              className="mt-6 bg-red-50 p-4 rounded space-y-3"
            >
              <h3 className="font-semibold text-lg">
                {editingTest ? "Edit Test" : "Create Test"}
              </h3>

              <input
                className="border p-2 w-full rounded"
                placeholder="Test ID"
                value={testForm.testId}
                onChange={(e) =>
                  setTestForm({ ...testForm, testId: e.target.value })
                }
                required
                disabled={!!editingTest}
              />

              <input
                className="border p-2 w-full rounded"
                placeholder="Title"
                value={testForm.title}
                onChange={(e) =>
                  setTestForm({ ...testForm, title: e.target.value })
                }
                required
              />

              <input
                className="border p-2 w-full rounded"
                type="number"
                placeholder="Duration (seconds)"
                value={testForm.durationSec}
                onChange={(e) =>
                  setTestForm({
                    ...testForm,
                    durationSec: Number(e.target.value),
                  })
                }
              />

              <select
                className="border p-2 w-full rounded"
                value={testForm.type}
                onChange={(e) =>
                  setTestForm({ ...testForm, type: e.target.value })
                }
              >
                <option value="MCQ">MCQ</option>
                <option value="Coding">Coding</option>
                <option value="Mixed">Mixed</option>
              </select>

              {/* ================================
   QUESTION SELECTOR (FIXED)
================================ */}
              <div className="bg-white p-4 rounded border mt-4">
                <h4 className="font-semibold mb-3">Add Questions</h4>

                {/* ---------------------------------------
     1) SHOW ALREADY SELECTED QUESTIONS
  ---------------------------------------- */}
                <div className="mb-4">
                  <h5 className="font-semibold">Already in this Test:</h5>

                  {testForm.questionIds.length === 0 ? (
                    <p className="text-sm text-gray-600">
                      No questions added yet.
                    </p>
                  ) : (
                    <ul className="mt-2 bg-gray-100 rounded p-3 space-y-2">
                      {testForm.questionIds.map((id, idx) => (
                        <li
                          key={id || idx}
                          className="flex justify-between items-center border p-2 rounded bg-white"
                        >
                          <span className="text-sm">
                            {getQuestionLabel(id)}
                          </span>

                          <button
                            className="bg-red-500 text-white px-2 py-1 rounded"
                            type="button"
                            onClick={() =>
                              setTestForm((prev) => ({
                                ...prev,
                                questionIds: prev.questionIds.filter(
                                  (q) => q !== id
                                ),
                              }))
                            }
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* ---------------------------------------
     2) MCQ / MIXED → GENRE DROPDOWN
  ---------------------------------------- */}
                {(testForm.type === "MCQ" || testForm.type === "Mixed") && (
                  <div className="mb-4">
                    <label className="text-sm font-medium block">
                      Select Genre
                    </label>

                    <select
                      className="border p-2 rounded w-full mt-1"
                      value={selectedGenre}
                      onChange={(e) => loadQuestionsByGenre(e.target.value)}
                    >
                      <option value="">Select Genre</option>
                      {genres.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>

                    {/* MCQ questions of selected genre */}
                    {selectedGenre && (
                      <div className="mt-3 bg-red-50 p-3 rounded max-h-60 overflow-auto">
                        <h5 className="font-semibold mb-2">
                          MCQs in "{selectedGenre}"
                        </h5>

                        {genreQuestions.map((q, idx) => {
                          const questionId = resolveQuestionId(q);
                          if (!questionId) return null;
                          return (
                            <div
                              key={questionId || idx}
                              className="flex justify-between items-center border p-2 rounded mb-2"
                            >
                              <p className="text-sm">
                                {q.questionText ||
                                  q.question ||
                                  q.title ||
                                  "Untitled question"}
                              </p>

                              <button
                                type="button"
                                onClick={() =>
                                  setTestForm((prev) => ({
                                    ...prev,
                                    questionIds: prev.questionIds.includes(
                                      questionId
                                    )
                                      ? prev.questionIds
                                      : [...prev.questionIds, questionId],
                                  }))
                                }
                                className="bg-green-500 text-white px-2 py-1 rounded"
                              >
                                Add
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* ---------------------------------------
     3) CODING / MIXED → CODING QUESTION LIST
  ---------------------------------------- */}
                {(testForm.type === "Coding" || testForm.type === "Mixed") && (
                  <div className="mt-4 bg-blue-50 p-3 rounded max-h-60 overflow-auto">
                    <h5 className="font-semibold mb-2">Coding Questions</h5>

                    {codingQuestions.map((q, idx) => {
                      const questionId = resolveQuestionId(q);
                      if (!questionId) return null;
                      return (
                        <div
                          key={questionId || idx}
                          className="flex justify-between items-center border p-2 rounded mb-2"
                        >
                          <p className="text-sm">
                            {q.title ||
                              q.questionText ||
                              q.question ||
                              "Untitled coding question"}
                          </p>

                          <button
                            type="button"
                            onClick={() =>
                              setTestForm((prev) => ({
                                ...prev,
                                questionIds: prev.questionIds.includes(
                                  questionId
                                )
                                  ? prev.questionIds
                                  : [...prev.questionIds, questionId],
                              }))
                            }
                            className="bg-green-500 text-white px-2 py-1 rounded"
                          >
                            Add
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <button className="bg-blue-500 text-white px-3 py-2 rounded">
                {editingTest ? "Update Test" : "Create Test"}
              </button>

              {editingTest && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingTest(null);
                    setTestForm({
                      testId: "",
                      title: "",
                      type: "MCQ",
                      durationSec: 600,
                      questionIds: [],
                    });
                  }}
                  className="ml-3 bg-gray-400 text-white px-3 py-2 rounded"
                >
                  Cancel
                </button>
              )}
            </form>

            <div className="mt-6">
              <h3 className="font-semibold">
                Tests for &quot;{selectedTrack}&quot;
              </h3>
              <ul className="mt-3 bg-red-100 p-4 rounded">
                {tests.map((test, idx) => (
                  <li
                    key={test.testId || test._id || idx}
                    className="border p-3 m-2 rounded bg-red-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold">{test.title}</h4>
                        <p className="text-sm">ID: {test.testId}</p>
                        <p className="text-xs">
                          Duration: {test.durationSec}s — Questions:{" "}
                          {test.questionsCount ?? 0}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => startTestEdit(test)}
                          className="bg-blue-500 px-3 py-1 text-white rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteTest(selectedTrack, test.testId)
                          }
                          className="bg-red-600 px-3 py-1 text-white rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <p className="mt-4 text-sm">Select a track to manage its tests.</p>
        )}
      </div>
    </div>
  );
};

export default AdminAssessments;