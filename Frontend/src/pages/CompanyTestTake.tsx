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

  // Calculate score on frontend using correct answers from questions
  const calculateScoreFromResponses = useMemo(() => {
    if (!sections.length) return null;
    
    let totalPoints = 0;
    let earnedPoints = 0;
    const sectionScores: Record<string, { earned: number; total: number; details: any[] }> = {};
    
    sections.forEach((section) => {
      let sectionEarned = 0;
      let sectionTotal = 0;
      const details: any[] = [];
      
      section.questions.forEach((q: any) => {
        // Only evaluate MCQ questions
        if (q.type === 'MCQ' || q.type === 'mcq') {
          const points = q.points ?? section.pointsPerQuestion ?? 1;
          sectionTotal += points;
          totalPoints += points;
          
          // Get submitted answer for this question (inline getSubmittedValue logic)
          const sectionResponses = Array.isArray(responses[section.key]) ? responses[section.key] : [];
          const found = sectionResponses.find((r) => String(r.bankId) === String(q.bankId));
          const submittedValue = found ? found.value : undefined;
          const correctAnswer = q.correctAnswer;
          
          // Check if answer is correct
          const isCorrect = submittedValue !== undefined && 
                           typeof correctAnswer !== 'undefined' &&
                           Number(submittedValue) === Number(correctAnswer);
          
          if (isCorrect) {
            sectionEarned += points;
            earnedPoints += points;
          }
          
          // Store detail for display
          details.push({
            bankId: q.bankId,
            correct: isCorrect,
            submitted: submittedValue,
            correctIndex: correctAnswer,
            points: points
          });
        }
      });
      
      sectionScores[section.key] = { 
        earned: sectionEarned, 
        total: sectionTotal,
        details: details
      };
    });
    
    return {
      total: totalPoints,
      earned: earnedPoints,
      sectionScores
    };
  }, [sections, responses]);

  // Submit responses to server (wrap into object { responses })
  const handleSubmit = async () => {
    if (!slug || !testId) return;
    // simple confirm
    const ok = window.confirm("Submit test? You will not be able to change answers afterwards.");
    if (!ok) return;
    setLoading(true);
    try {
      // Calculate score on frontend
      const scoreResult = calculateScoreFromResponses;
      
      // Create result object with frontend-calculated score
      const frontendResult = {
        score: scoreResult?.earned || 0,
        total: scoreResult?.total || 0,
        details: scoreResult ? Object.keys(scoreResult.sectionScores).reduce((acc, key) => {
          acc[key] = scoreResult.sectionScores[key].details;
          return acc;
        }, {} as Record<string, any[]>) : {}
      };
      
      // Optionally send to server (if you want to persist)
      try {
        const payload = { responses };
        await submitCompanyTest(slug, testId, payload);
      } catch (err) {
        console.warn("Failed to submit to server, but score calculated locally", err);
      }
      
      // Set result with frontend-calculated score
      setResult(frontendResult);
      
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

  // Use the frontend-calculated score from result (set on submit)
  const calculateScore = useMemo(() => {
    if (!result) return calculateScoreFromResponses;
    
    // If result exists, use it (it was calculated on submit from frontend)
    return {
      total: result.total || 0,
      earned: result.score || 0,
      sectionScores: Object.keys(result.details || {}).reduce((acc, key) => {
        const details = result.details[key] || [];
        let earned = 0;
        let total = 0;
        details.forEach((det: any) => {
          if (det.points) {
            total += det.points;
            if (det.correct) {
              earned += det.points;
            }
          }
        });
        acc[key] = { earned, total, details };
        return acc;
      }, {} as Record<string, { earned: number; total: number; details: any[] }>)
    };
  }, [result, calculateScoreFromResponses]);

  if (loading && !meta) return <div className="p-6 text-center">Loading...</div>;
  if (!meta) return <div className="p-6 text-center">No test available.</div>;

  const currentQuestion = currentSectionObj?.questions?.[selectedQuestionIndex] ?? null;
  const totalQuestions = currentSectionObj?.questions?.length ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#fff6f6] to-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header with Score */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-[#C21817]">{meta.title}</h1>
              <div className="text-sm text-gray-500 mt-1">Test ID: {meta.testId}</div>
            </div>
            {!result && (
              <button
                onClick={() => handleSubmit()}
                disabled={loading || Object.keys(responses).length === 0}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-[#C21817] to-[#A51515] text-white font-semibold shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Submitting..." : "Submit Test"}
              </button>
            )}
          </div>

          {/* Score Display */}
          {result && (
            <div className="bg-gradient-to-r from-[#C21817] to-[#A51515] rounded-2xl shadow-lg p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Test Submitted Successfully!</h2>
                  {/* Display point-based score - use calculateScore if available, otherwise fallback to server values */}
                  {calculateScore && (calculateScore.total > 0 || calculateScore.earned > 0) ? (
                    <>
                      <div className="text-4xl font-bold mb-1">
                        {calculateScore.earned} / {calculateScore.total}
                      </div>
                      <div className="text-lg opacity-90">
                        {calculateScore.total > 0 
                          ? `${Math.round((calculateScore.earned / calculateScore.total) * 100)}%` 
                          : "0%"}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Fallback to server's count-based score if calculation failed */}
                      <div className="text-4xl font-bold mb-1">
                        {result.score ?? 0} / {result.total ?? 0}
                      </div>
                      <div className="text-lg opacity-90">
                        {(result.total ?? 0) > 0 
                          ? `${Math.round(((result.score ?? 0) / (result.total ?? 1)) * 100)}%` 
                          : "0%"}
                      </div>
                      <div className="text-xs opacity-75 mt-1">
                        (Count-based score - check console for details)
                      </div>
                    </>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm opacity-90 mb-2">Score Breakdown by Section</div>
                  {calculateScore && Object.keys(calculateScore.sectionScores).length > 0 ? (
                    sections.map((s) => {
                      const secScore = calculateScore.sectionScores[s.key];
                      if (!secScore || secScore.total === 0) return null;
                      return (
                        <div key={s.key} className="text-sm mb-1">
                          {s.title}: {secScore.earned} / {secScore.total} points
                        </div>
                      );
                    }).filter(Boolean)
                  ) : (
                    <div className="text-sm mb-1">
                      {result.details ? 'Check browser console for debugging info' : 'No details available'}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/20 text-sm opacity-90">
                Note: Score is calculated based on section points. Only MCQ questions are auto-graded. Descriptive and coding questions require manual grading.
                {(!calculateScore || calculateScore.total === 0) && (
                  <div className="mt-2 text-xs">
                    Debug: Open browser console (F12) to see detailed calculation logs.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar: Sections with Navigation */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100 sticky top-6">
              <h3 className="font-bold text-lg mb-4 text-gray-800">Sections</h3>
              <div className="space-y-3">
                {sections.map((s) => {
                  const isActive = selectedSection === s.key;
                  const sectionQuestions = s.questions || [];
                  const answeredCount = sectionQuestions.filter((q: any) => 
                    getSubmittedValue(s.key, q.bankId) !== undefined
                  ).length;
                  
                  return (
                    <div key={s.key} className={`rounded-lg border-2 ${isActive ? "border-[#C21817] bg-red-50" : "border-gray-200 bg-white"}`}>
                      <button
                        onClick={() => {
                          setSelectedSection(s.key);
                          setSelectedQuestionIndex(0);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-t-lg ${isActive ? "bg-red-50" : "hover:bg-gray-50"}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-semibold text-gray-800">{s.title}</div>
                          <div className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {s.key.toUpperCase()}
                          </div>
                        </div>
                        <div className="text-xs text-gray-600">
                          {answeredCount} / {sectionQuestions.length} answered
                        </div>
                      </button>
                      
                      {/* Question Navigation for Active Section */}
                      {isActive && sectionQuestions.length > 0 && (
                        <div className="p-3 bg-gray-50 rounded-b-lg border-t border-gray-200">
                          <div className="text-xs font-semibold text-gray-700 mb-2">Questions</div>
                          <div className="grid grid-cols-5 gap-2">
                            {sectionQuestions.map((q: any, qi: number) => {
                              const submitted = getSubmittedValue(s.key, q.bankId);
                              const isCurrent = qi === selectedQuestionIndex;
                              const det = result?.details?.[s.key]?.find((d: any) => String(d.bankId) === String(q.bankId));
                              const isCorrect = det?.correct === true;
                              
                              let bgColor = "bg-white border-gray-300";
                              if (result) {
                                if (isCorrect) bgColor = "bg-green-500 text-white border-green-600";
                                else if (det && typeof det.correctIndex !== "undefined") bgColor = "bg-red-500 text-white border-red-600";
                                else bgColor = "bg-gray-300 text-gray-700 border-gray-400";
                              } else if (submitted !== undefined) {
                                bgColor = "bg-blue-500 text-white border-blue-600";
                              }
                              
                              if (isCurrent) bgColor += " ring-2 ring-[#C21817] ring-offset-1";
                              
                              return (
                                <button
                                  key={q.bankId}
                                  onClick={() => setSelectedQuestionIndex(qi)}
                                  className={`w-8 h-8 flex items-center justify-center rounded-md border text-xs font-semibold transition-all ${bgColor}`}
                                  title={`Question ${qi + 1}`}
                                >
                                  {qi + 1}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content: Single Question View */}
          <div className="lg:col-span-9">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              {currentSectionObj && currentQuestion ? (
                <>
                  {/* Question Header */}
                  <div className="mb-6 pb-4 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-800">
                        {currentSectionObj.title}
                      </h3>
                      <div className="text-sm text-gray-600">
                        Question {selectedQuestionIndex + 1} of {totalQuestions}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Points: <strong>{currentQuestion.points ?? 1}</strong></span>
                      <span>Type: <strong>{currentQuestion.type}</strong></span>
                    </div>
                  </div>

                  {/* Question Content */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">
                      {currentQuestion.question}
                    </h4>

                    {(() => {
                      const det = result?.details?.[currentSectionObj.key]?.find((d: any) => String(d.bankId) === String(currentQuestion.bankId));
                      
                      return currentQuestion.type === "MCQ" ? (
                        <div className="space-y-3">
                          {currentQuestion.options?.map((opt: string, oi: number) => {
                            const optionLabel = String.fromCharCode(65 + oi);
                            const userVal = getSubmittedValue(currentSectionObj.key, currentQuestion.bankId);
                            const selected = userVal !== undefined && Number(userVal) === oi;
                            const isCorrectOption = det && typeof det.correctIndex !== "undefined" && Number(det.correctIndex) === oi;
                            const userSubmittedIndex = det && typeof det.submitted !== "undefined" ? Number(det.submitted) : undefined;

                          let optionClass = "flex items-center gap-4 p-4 rounded-lg border-2 transition-all cursor-pointer";
                          if (result) {
                            if (isCorrectOption) {
                              optionClass += " bg-green-50 border-green-400";
                            } else if (userSubmittedIndex === oi) {
                              optionClass += " bg-red-50 border-red-400";
                            } else {
                              optionClass += " bg-gray-50 border-gray-200";
                            }
                          } else {
                            optionClass += selected 
                              ? " bg-blue-50 border-blue-400" 
                              : " bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50";
                          }

                          return (
                            <label key={oi} className={optionClass}>
                              <input
                                type="radio"
                                name={`q-${currentSectionObj.key}-${currentQuestion.bankId}`}
                                checked={selected}
                                onChange={() => setAnswer(currentSectionObj.key, currentQuestion.bankId, oi)}
                                disabled={!!result}
                                className="w-5 h-5 text-[#C21817] focus:ring-[#C21817]"
                              />
                              <div className="flex-1">
                                <div className="font-medium text-gray-800">
                                  <span className="font-bold mr-2">{optionLabel}.</span>
                                  {opt}
                                </div>
                              </div>
                              {result && (
                                <div className="flex items-center gap-2">
                                  {isCorrectOption && (
                                    <span className="text-green-600 font-bold text-sm">✓ Correct</span>
                                  )}
                                  {userSubmittedIndex === oi && !isCorrectOption && (
                                    <span className="text-red-600 font-bold text-sm">✗ Your Answer</span>
                                  )}
                                </div>
                              )}
                            </label>
                          );
                        })}
                      </div>
                    ) : (
                      <div>
                        <textarea
                          className="w-full border-2 border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-[#C21817] focus:border-transparent resize-none"
                          rows={8}
                          value={String(getSubmittedValue(currentSectionObj.key, currentQuestion.bankId) ?? "")}
                          onChange={(e) => setAnswer(currentSectionObj.key, currentQuestion.bankId, e.target.value)}
                          disabled={!!result}
                          placeholder="Write your answer here... (This will be manually graded)"
                        />
                        {result && (
                          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                            ⚠ This question requires manual grading and is not included in the auto-calculated score.
                          </div>
                        )}
                      </div>
                    );
                    })()}

                    {/* Result Details */}
                    {result && (() => {
                      const det = result?.details?.[currentSectionObj.key]?.find((d: any) => String(d.bankId) === String(currentQuestion.bankId));
                      return det && typeof det.correctIndex !== "undefined" ? (
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Correct Answer:</span>
                            <span className="ml-2 font-bold text-green-600">
                              {String.fromCharCode(65 + Number(det.correctIndex))}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Your Answer:</span>
                            <span className={`ml-2 font-bold ${det.correct ? "text-green-600" : "text-red-600"}`}>
                              {typeof det.submitted !== "undefined" ? String.fromCharCode(65 + Number(det.submitted)) : "Not answered"}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-300">
                          <span className="text-gray-600">Result: </span>
                          <span className={`font-bold ${det.correct ? "text-green-600" : "text-red-600"}`}>
                            {det.correct ? "✓ Correct" : "✗ Incorrect"}
                          </span>
                          {currentQuestion.points && (
                            <span className="ml-4 text-gray-600">
                              Points: {det.correct ? currentQuestion.points : 0} / {currentQuestion.points}
                            </span>
                          )}
                        </div>
                        {det.note && (
                          <div className="mt-3 pt-3 border-t border-gray-300 text-sm text-gray-700">
                            <strong>Note:</strong> {det.note}
                          </div>
                        )}
                      </div>
                      ) : null;
                    })()}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                    <button
                      onClick={() => {
                        if (selectedQuestionIndex > 0) {
                          setSelectedQuestionIndex(selectedQuestionIndex - 1);
                        } else {
                          // Go to previous section's last question
                          const currentIdx = sections.findIndex(s => s.key === selectedSection);
                          if (currentIdx > 0) {
                            const prevSection = sections[currentIdx - 1];
                            setSelectedSection(prevSection.key);
                            setSelectedQuestionIndex((prevSection.questions?.length ?? 1) - 1);
                          }
                        }
                      }}
                      disabled={selectedSection === sections[0]?.key && selectedQuestionIndex === 0}
                      className="px-6 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      ← Previous
                    </button>

                    <div className="text-sm text-gray-600">
                      {selectedQuestionIndex + 1} / {totalQuestions}
                    </div>

                    <button
                      onClick={() => {
                        if (selectedQuestionIndex < totalQuestions - 1) {
                          setSelectedQuestionIndex(selectedQuestionIndex + 1);
                        } else {
                          // Go to next section's first question
                          const currentIdx = sections.findIndex(s => s.key === selectedSection);
                          if (currentIdx < sections.length - 1) {
                            const nextSection = sections[currentIdx + 1];
                            setSelectedSection(nextSection.key);
                            setSelectedQuestionIndex(0);
                          }
                        }
                      }}
                      disabled={selectedSection === sections[sections.length - 1]?.key && selectedQuestionIndex === totalQuestions - 1}
                      className="px-6 py-2 rounded-lg bg-[#C21817] text-white font-medium hover:bg-[#A51515] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg">Please select a section to begin</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
