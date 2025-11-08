/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { startCompanyTest, submitCompanyTest } from "../services/companyTestApi";

/**
 Expected startCompanyTest(slug,testId) returns:
 { testId, title, sections: [{ key, title, questions: [{ qIndex, bankId, type, question, options, points }] }] }
 submitCompanyTest(slug,testId, { responses }) expects responses shaped:
 { sectionKey: [{ bankId, value }, ...], ... }
 and returns { score, total, details: { [sectionKey]: [{ bankId, correct, submitted, correctIndex, ... }] } }
*/

export default function CompanyTestTake() {
  const { slug, testId } = useParams<{ slug?: string; testId?: string }>();
  const [meta, setMeta] = useState<any | null>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [responses, setResponses] = useState<Record<string, Array<{ bankId: string; value: any }>>>({});
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!slug || !testId) return;
    (async () => {
      setLoading(true);
      try {
        const started = await startCompanyTest(slug, testId);
        // started: { testId, title, sections: [...] }
        setMeta({ title: started.title, testId: started.testId });
        // ensure qIndex present (per-section index)
        const secs = (started.sections || []).map((s: any) => ({
          ...s,
          questions: (s.questions || []).map((q: any, i: number) => ({ ...q, qIndex: i })),
        }));
        setSections(secs);
        // pick first section by default
        if (secs.length > 0) {
          setSelectedSection(secs[0].key);
          setSelectedQuestionIndex(secs[0].questions && secs[0].questions.length ? 0 : -1);
        }
      } catch (err) {
        console.error("Failed to start company test", err);
        alert("Failed to load test. Returning back.");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug, testId, navigate]);

  // Derived: current section & question
  const currentSectionObj = useMemo(() => sections.find((s) => s.key === selectedSection) ?? null, [sections, selectedSection]);
  // currentQuestion unused — keep selection logic via selectedQuestionIndex and currentSectionObj

  // update responses in the required shape { sectionKey: [{ bankId, value }] }
  const setAnswer = (sectionKey: string, bankId: string, value: any) => {
    setResponses((prev) => {
      const copy = { ...prev };
      const arr = Array.isArray(copy[sectionKey]) ? [...copy[sectionKey]] : [];
      // we don't store qIndex in payload - just bankId & value; use bankId to find existing entry
      const foundIdx = arr.findIndex((it) => String(it.bankId) === String(bankId));
      if (foundIdx === -1) {
        arr.push({ bankId: String(bankId), value });
      } else {
        arr[foundIdx] = { ...arr[foundIdx], value };
      }
      copy[sectionKey] = arr;
      return copy;
    });
  };

  // helper to read submitted value for UI
  const getSubmittedValue = (sectionKey: string, bankId: string) => {
    const arr = Array.isArray(responses[sectionKey]) ? responses[sectionKey] : [];
    const found = arr.find((r) => String(r.bankId) === String(bankId));
    return found ? found.value : undefined;
  };

  // Submit responses to server (wrap into object { responses })
  const handleSubmit = async () => {
    if (!slug || !testId) return;
    // simple confirm
    const ok = window.confirm("Submit test? You will not be able to change answers afterwards.");
    if (!ok) return;
    setLoading(true);
    try {
      // server expects body: { responses: {...} }
      const payload = { responses };
      const res = await submitCompanyTest(slug, testId, payload);
      setResult(res);
      // reveal first section and question with result
      if (sections.length > 0) {
        setSelectedSection(sections[0].key);
        setSelectedQuestionIndex(0);
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Submit failed", err);
      alert("Failed to submit test");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !meta) return <div className="p-6">Loading...</div>;
  if (!meta) return <div className="p-6">No test available.</div>;

  // avoid unused-local compile error for selection index (used by setters)
  void selectedQuestionIndex;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#fff6f6] to-white py-10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#C21817]">{meta.title}</h1>
            <div className="text-sm text-gray-500 mt-1">Test ID: {meta.testId}</div>
          </div>

          <div>
            <button
              onClick={() => handleSubmit()}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded bg-gradient-to-r from-[#C21817] to-[#A51515] text-white font-medium shadow"
            >
              {loading ? "Submitting..." : "Submit Test"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sections list (left) */}
          <div className="col-span-1 bg-white rounded-2xl shadow p-4 border border-gray-100">
            <h3 className="font-semibold mb-3">Sections</h3>
            <div className="space-y-2">
              {sections.map((s) => {
                const isActive = selectedSection === s.key;
                return (
                  <button
                    key={s.key}
                    onClick={() => {
                      setSelectedSection(s.key);
                      setSelectedQuestionIndex(0);
                    }}
                    className={`w-full text-left px-3 py-2 rounded ${isActive ? "bg-red-50 border border-red-100" : "hover:bg-gray-50"}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{s.title}</div>
                        <div className="text-xs text-gray-500">{(s.questions || []).length} questions</div>
                      </div>
                      <div className="text-xs text-gray-400">{s.key.toUpperCase()}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {result && (
              <div className="mt-4 p-3 bg-red-50 rounded">
                <div className="font-medium">Score: {result.score} / {result.total}</div>
                <div className="text-xs text-gray-600 mt-1">MCQ auto-graded. Descriptive / coding are not auto-graded.</div>
              </div>
            )}
          </div>

          {/* Questions list (middle) */}
          <div className="col-span-1 lg:col-span-2">
            <div className="bg-white rounded-2xl shadow p-4 border border-gray-100">
              <h3 className="font-semibold mb-3">
                {currentSectionObj ? `Section: ${currentSectionObj.title}` : "Select a section"}
              </h3>

              {currentSectionObj ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentSectionObj.questions.map((q: any, qi: number) => {
                    const userVal = getSubmittedValue(currentSectionObj.key, q.bankId);
                    // result detail for this question if available
                    const det = result?.details?.[currentSectionObj.key]?.find((d: any) => String(d.bankId) === String(q.bankId));
                    return (
                      <div key={q.bankId} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium mb-2 text-gray-800">{qi + 1}. {q.question}</div>
                            <div className="text-sm text-gray-600 mb-3">Points: {q.points ?? 1}</div>

                            {q.type === "MCQ" ? (
                              <div className="space-y-2">
                                {q.options.map((opt: string, oi: number) => {
                                  const optionLabel = String.fromCharCode(65 + oi);
                                  const selected = userVal !== undefined && Number(userVal) === oi;
                                  // show correct/incorrect after submit
                                  const isCorrectOption = det && typeof det.correctIndex !== "undefined" && Number(det.correctIndex) === oi;
                                  const userSubmittedIndex = det && typeof det.submitted !== "undefined" ? Number(det.submitted) : undefined;

                                  return (
                                    <label key={oi} className={`flex items-center gap-3 p-2 rounded ${result ? (isCorrectOption ? "bg-green-50 border border-green-100" : (userSubmittedIndex === oi ? "bg-red-50 border border-red-100" : "bg-white border border-gray-100")) : "bg-white border border-gray-100 hover:bg-gray-50"}`}>
                                          <input
                                            type="radio"
                                            name={`q-${currentSectionObj.key}-${q.bankId}`}
                                            checked={selected}
                                            onChange={() => setAnswer(currentSectionObj.key, q.bankId, oi)}
                                            disabled={!!result} // lock after submit
                                          />
                                      <div className="flex-1">
                                        <div className="text-sm">{optionLabel}. {opt}</div>
                                      </div>
                                      {result && isCorrectOption && <div className="text-green-600 font-semibold text-sm">Correct</div>}
                                      {result && userSubmittedIndex === oi && !isCorrectOption && <div className="text-red-600 font-semibold text-sm">Your answer</div>}
                                    </label>
                                  );
                                })}
                              </div>
                            ) : (
                              <div>
                                <textarea
                                  className="w-full border p-2 rounded"
                                  rows={4}
                                  value={String(getSubmittedValue(currentSectionObj.key, q.bankId) ?? "")}
                                  onChange={(e) => setAnswer(currentSectionObj.key, q.bankId, e.target.value)}
                                  disabled={!!result}
                                  placeholder="Write your answer (will be manually graded)"
                                />
                                {result && <div className="mt-2 text-xs text-gray-600">Not auto-graded</div>}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* if result available and question auto-graded, show details */}
                        {result && det && typeof det.correctIndex !== "undefined" && (
                          <div className="mt-3 text-sm">
                            <div>Correct option: <strong>{String.fromCharCode(65 + Number(det.correctIndex))}</strong></div>
                            <div>Your submitted: <strong>{typeof det.submitted !== "undefined" ? String.fromCharCode(65 + Number(det.submitted)) : "—"}</strong></div>
                            <div>Result: {det.correct ? <span className="text-green-600 font-semibold">Correct</span> : <span className="text-red-600 font-semibold">Incorrect</span>}</div>
                          </div>
                        )}

                        {result && det && det.note && (
                          <div className="mt-3 text-sm text-gray-600">Note: {det.note}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-sm text-gray-500">No section selected.</div>
              )}
            </div>
          </div>

          {/* Right column: summary / navigation */}
          <aside className="col-span-1 bg-white rounded-2xl shadow p-4 border border-gray-100">
            <h3 className="font-semibold mb-3">Navigation</h3>
            {currentSectionObj ? (
              <div className="space-y-2">
                <div className="text-sm text-gray-600 mb-2">Questions in current section</div>
                <div className="grid grid-cols-6 gap-2">
                  {currentSectionObj.questions.map((q: any, qi: number) => {
                    const submitted = getSubmittedValue(currentSectionObj.key, q.bankId);
                    // style
                    const base = "w-9 h-9 flex items-center justify-center rounded-md border cursor-pointer";
                    const filled = submitted !== undefined ? "bg-red-600 text-white border-red-600" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50";
                    return (
                      <button
                        key={q.bankId}
                        className={`${base} ${filled}`}
                        onClick={() => setSelectedQuestionIndex(qi)}
                      >
                        {qi + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">Select a section to view questions</div>
            )}

            <div className="mt-4 border-t pt-4">
              <div className="text-sm text-gray-600 mb-2">Actions</div>
              <button
                onClick={() => {
                  // go to previous question (if possible)
                  if (!currentSectionObj) return;
                  setSelectedQuestionIndex((prev) => Math.max(0, prev - 1));
                }}
                className="px-3 py-2 mr-2 rounded bg-gray-100"
                disabled={!currentSectionObj}
              >
                Prev
              </button>
              <button
                onClick={() => {
                  if (!currentSectionObj) return;
                  setSelectedQuestionIndex((prev) => Math.min(currentSectionObj.questions.length - 1, prev + 1));
                }}
                className="px-3 py-2 rounded bg-gray-100"
                disabled={!currentSectionObj}
              >
                Next
              </button>

              <div className="mt-4 text-xs text-gray-500">
                After submission, answers are locked and auto-graded MCQs will show results here.
              </div>
            </div>

            <div className="mt-6">
              <div className="text-xs text-gray-600 mb-2">Jump to section</div>
              <div className="space-y-2">
                {sections.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => { setSelectedSection(s.key); setSelectedQuestionIndex(0); }}
                    className={`w-full text-left px-3 py-2 rounded ${selectedSection === s.key ? "bg-red-50 border border-red-100" : "hover:bg-gray-50"}`}
                  >
                    {s.title}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
