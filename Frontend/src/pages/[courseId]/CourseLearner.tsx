/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { coursesApi } from "../../services/GlobalApi";
import type { Chapters, CourseData } from "../../types/course";
import CourseDetails from "../CourseDetailsForLearner";
import NotesDisplay from "../../components/NotesDisplay";
import { pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
import {
  Brain,
  Play,
  Clock,
  BookOpen,
  ChevronDown,
  MoreHorizontal,
  CheckIcon,
  ArrowUpLeft,
} from "lucide-react";
import { useAuthContext } from "../../context/AuthProvider";
import {
  fetchPurchasedCourses,
  markChapterCompleted,
} from "../../services/userApi";

const FALLBACK_THUMB = "/assets/no-image.png";

export type VideoSource = {
  type: "youtube" | "drive" | "direct" | "other" | "none";
  playable: string;
  preview: string;
};

// --- Helper Functions ---
const extractDriveId = (url?: string): string | null => {
  if (!url) return null;
  const patterns = [
    /\/d\/([a-zA-Z0-9_-]+)\//, // /file/d/ID/
    /[?&]id=([a-zA-Z0-9_-]+)/, // ?id=ID or &id=ID
    /\/file\/d\/([a-zA-Z0-9_-]+)$/, // /file/d/ID
    /\/uc\?export=download&id=([a-zA-Z0-9_-]+)/, // /uc?export=download&id=ID
  ];
  for (const re of patterns) {
    const match = url.match(re);
    if (match?.[1]) return match[1];
  }
  return null;
};

const resolveVideoSource = (url?: string): VideoSource => {
  if (!url) return { type: "none", playable: "", preview: "" };

  // 1. YouTube (watch?v=, youtu.be/, embed/)
  const ytRegex =
    /(?:youtube\.com\/.*v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
  const ytMatch = url.match(ytRegex);
  if (ytMatch) {
    const id = ytMatch[1];
    return {
      type: "youtube",
      playable: `https://www.youtube.com/embed/${id}`,
      preview: "",
    };
  }

  // 2. Google Drive
  const driveId = extractDriveId(url);
  if (driveId) {
    return {
      type: "drive",
      playable: `https://drive.google.com/uc?export=download&id=${driveId}`,
      preview: `https://drive.google.com/file/d/${driveId}/preview`,
    };
  }

  // 3. Direct video extension (.mp4, .webm, .mov, etc.)
  const exts = [".mp4", ".mov", ".webm", ".ogg", ".m4v"];
  const lower = url.toLowerCase();
  if (exts.some((ext) => lower.endsWith(ext))) {
    return { type: "direct", playable: url, preview: "" };
  }

  return { type: "other", playable: url, preview: "" };
};

const useVideoSource = (url?: string) => {
  return useMemo(() => resolveVideoSource(url), [url]);
};

const convertThumbnail = (thumbnail: any) => {
  if (!thumbnail?.data || !thumbnail?.contentType) return "";
  try {
    const byteArray = new Uint8Array(thumbnail.data?.data ?? thumbnail.data);
    let binary = "";
    const chunkSize = 0x8000;

    for (let i = 0; i < byteArray.length; i += chunkSize) {
      const chunk = byteArray.subarray(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
    }

    const base64 = btoa(binary);
    return `data:${thumbnail.contentType};base64,${base64}`;
  } catch (err) {
    console.error("Thumbnail conversion error:", err);
    return "";
  }
};

const baseURL = import.meta.env.VITE_API_URL;

const CourseLearningPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<CourseData | null>(null);
  const [chapter, setChapter] = useState<Chapters | null>(null);
  const video = useVideoSource(chapter?.video);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [thumbnailUrl, setThumbnailUrl] = useState(FALLBACK_THUMB);
  const [videoError, setVideoError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<number[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [completedChapters, setCompletedChapters] = useState<string[]>([]);
  const [scores, setScores] = useState<{ [quizId: string]: number }>({});
  const { user } = useAuthContext();

  const [quizOpen, setQuizOpen] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [quizResults, setQuizResults] = useState<null | {
    score: number;
    answers: any[];
  }>(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  const goToNextChapter = () => {
    if (!course || !chapter) return;
    let found = false;
    for (const section of course.sections || []) {
      for (const ch of section.chapters || []) {
        if (found) {
          onSelectChapter(ch);
          return;
        }
        if (ch === chapter) found = true;
      }
    }
  };

  const generateQuiz = async (chapter: Chapters, course: CourseData) => {
    const res = await fetch(`${baseURL}/api/upload/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chapterTitle: chapter.title,
        courseContent: course.description,
      }),
    });
    const data = await res.json();
    setQuizQuestions(data.questions ?? []);
    setQuizOpen(true);
    document.body.style.overflow = "hidden";
  };

  const handleAnswer = (questionIndex: number, optionIndex: number) => {
    const optionLetter = String.fromCharCode(65 + optionIndex);
    setUserAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionLetter,
    }));
  };

  const submitQuiz = async () => {
    if (!quizQuestions.length) return;

    let score = 0;
    const answers = quizQuestions.map((q, i) => {
      const userAnswer = userAnswers[i];
      let expectedLetter = q.correctAnswerLetter;
      if (!expectedLetter && q.correctAnswerText && Array.isArray(q.options)) {
        const idx = q.options.findIndex(
          (opt: any) => String(opt) === String(q.correctAnswerText),
        );
        if (idx >= 0) expectedLetter = String.fromCharCode(65 + idx);
      }
      const isCorrect =
        userAnswer && expectedLetter ? userAnswer === expectedLetter : false;
      if (isCorrect) score++;
      return {
        question: q.question,
        userAnswer,
        correctAnswer: expectedLetter || q.correctAnswer || q.correctAnswerText,
        isCorrect,
      };
    });

    setQuizResults({ score, answers });

    if (user?.sub && courseId && chapter?.title) {
      try {
        await markChapterCompleted(user.sub, courseId, [
          ...completedChapters,
          chapter.title,
        ]);
        setScores((prev) => ({ ...prev, [chapter.title]: score }));
      } catch (err) {
        console.error("Failed to save quiz score:", err);
      }
    }
    document.body.style.overflow = "auto";
  };

  const toggleSection = (index: number) => {
    setExpandedSections((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const markChapterComplete = async (chapterTitle: string) => {
    if (chapter) {
      setLoadingQuiz(true);
      try {
        await generateQuiz(chapter, course!);
      } finally {
        setLoadingQuiz(false);
      }
    }
    const updatedChapters = Array.from(
      new Set([...completedChapters, chapterTitle]),
    );
    setCompletedChapters(updatedChapters);

    if (!user?.sub || !courseId) return;

    try {
      const res = await markChapterCompleted(
        user.sub,
        courseId,
        updatedChapters,
      );
      console.log("Updated completed chapters:", res);
    } catch (err) {
      console.error("Failed to mark chapter complete:", err);
    }
  };

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) return console.warn("No course ID provided");

      setLoading(true);
      try {
        const res: CourseData = await coursesApi.getById(courseId);
        setCourse(res);

        if (user?.sub) {
          const purchasedCourses = await fetchPurchasedCourses(user.sub);
          const thisCourse = purchasedCourses.find(
            (c: any) => c.CourseId === courseId,
          );
          if (thisCourse) {
            setCompletedChapters((thisCourse.completedChapters ?? []).flat());
            setScores(thisCourse.scores ?? {});
          }
        }

        setExpandedSections([0]);

        const firstChapter = res.sections?.[0]?.chapters?.[0];
        if (firstChapter) {
          setChapter(firstChapter);
          setVideoError(false);
        }

        if (res.thumbnail) {
          const thumb = convertThumbnail(res.thumbnail);
          if (thumb) setThumbnailUrl(thumb);
        }
      } catch (err) {
        console.error("Failed to load course:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, user]);

  useEffect(() => {
    setVideoError(false);
  }, [video.playable, video.preview, video.type]);

  const onSelectChapter = (selected: Chapters) => {
    if (selected.type === "quiz") {
      return (window.location.href = `/my-courses/test/${selected.testId}`);
    }
    if (selected.type === "assignment") {
      return (window.location.href = `/coding-quiz/${selected.testId}`);
    }

    setChapter(selected);
    setVideoError(false);

    if ((selected as any).notesId) {
      const doc = (course?.sections || [])
        .flatMap((s) => s.chapters || [])
        .find((ch) => ch.notesId === (selected as any).notesId);
      const pdfNote = (doc as any)?.notes?.find?.(
        (n: any) =>
          typeof n.content === "string" &&
          n.content.startsWith("/uploads/notes/"),
      );
      setPdfUrl(pdfNote?.content || "");
    } else {
      setPdfUrl("");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 font-medium">Loading your course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Course not found
          </h2>
          <p className="text-gray-600">
            The course you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-Quick">
      <div className="grid grid-cols-1 xl:grid-cols-3">
        {/* Main Content */}
        <main className="col-span-2 flex-1 min-h-screen bg-white">
          <header className="w-full flex justify-between px-8 py-3">
            <img
              src="/assets/Sunadh-Logo.png"
              alt="Logo"
              className="h-16 w-auto"
            />
            <a
              href="/my-learning"
              className="flex lg:hidden items-center gap-1"
            >
              <ArrowUpLeft />
              My Learning
            </a>
          </header>
          {/* Video Section */}
          <div className="relative p-4 sm:p-8 w-full min-h-[60vh] flex items-center justify-center">
            <div className="w-full max-w-6xl">
              {pdfUrl ? (
                <div className="w-full">
                  <NotesDisplay
                    notesId={chapter?.notesId}
                    manualNotes={chapter?.notes || []}
                    className="min-h-[50vh]"
                  />
                </div>
              ) : video.type === "direct" && !videoError ? (
                <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    key={video.playable}
                    src={video.playable}
                    controls
                    controlsList="nodownload"
                    poster={thumbnailUrl}
                    className="w-full h-full object-contain"
                    onError={() => setVideoError(true)}
                    onEnded={() =>
                      chapter?.title && markChapterComplete(chapter.title)
                    }
                  />
                </div>
              ) : video.type === "youtube" || video.type === "drive" ? (
                <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
                  <iframe
                    title="Video preview"
                    src={
                      video.type === "youtube" ? video.playable : video.preview
                    }
                    allow="autoplay; encrypted-media; fullscreen"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              ) : thumbnailUrl ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <img
                    src={thumbnailUrl}
                    alt="Course Thumbnail"
                    className="max-w-full h-44 object-contain mb-4 rounded-lg"
                  />
                  <p>Preview not available</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <BookOpen size={48} className="text-gray-600 mb-4" />
                  <p>No video content available</p>
                </div>
              )}

              {/* Video Overlay */}
              <div className="absolute bottom-6 right-6 flex gap-2">
                <button className="bg-black bg-opacity-70 hover:bg-opacity-90 p-2 rounded-lg transition-all">
                  <MoreHorizontal size={20} className="text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Chapter & Course Details */}
          <div className="text-gray-900">
            <div className=" p-4 sm:p-6">
              {chapter && (
                <div className="p-4 sm:p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-xl sm:text-4xl font-heading font-bold text-gray-900 mb-2">
                      {chapter.title}
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock size={16} />
                        <span>{chapter.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {chapter.type === "quiz" ||
                        chapter.type === "assignment" ? (
                          <Brain size={16} />
                        ) : (
                          <Play size={16} />
                        )}
                        <span className="capitalize">{chapter.type}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 sm:mt-0">
                    <button
                      onClick={() =>
                        chapter.title && markChapterComplete(chapter.title)
                      }
                      className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors bg-blue-600 hover:bg-blue-400 shadow-md"
                    >
                      <CheckIcon size={16} />
                      Mark Complete
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-white">
                <CourseDetails course={course} chapter={chapter} />
              </div>
            </div>
          </div>
        </main>

        {/* Sidebar */}
        <aside
          className={`col-span-1 py-3 px-6 bg-gray-100 border border-gray-100 shadow-xl`}
        >
          <nav className="m-4 mb-6 hidden lg:flex w-fit justify-start border-b-2 border-black pb-2">
            <a href="/my-learning" className="flex items-center gap-1">
              <ArrowUpLeft />
              My Learning
            </a>
          </nav>
          <div className="flex flex-col h-full">
            <div className="p-4 mt-4">
              <h3 className="font-extrabold text-2xl mb-1">Course Overview</h3>
              <p className="text-sm">
                {course.sections?.length || 0} sections •{" "}
                {course.sections?.reduce(
                  (acc, s) => acc + (s.chapters?.length || 0),
                  0,
                )}{" "}
                lectures
              </p>
            </div>

            <div className="flex-1 gap-2 overflow-y-auto custom-scrollbar">
              {course.sections?.map((section, sectionIndex) => (
                <div
                  key={`section-${sectionIndex}`}
                  className="m-2 rounded-xl bg-gray-50 border border-gray-200 shadow-sm overflow-hidden"
                >
                  <button
                    className={`w-full text-left p-4 ${
                      expandedSections.includes(sectionIndex)
                        ? "bg-zinc-100"
                        : ""
                    } hover:bg-zinc-50 transition-colors flex items-center justify-between group`}
                    onClick={() => toggleSection(sectionIndex)}
                    aria-expanded={expandedSections.includes(sectionIndex)}
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm mb-1 truncate">
                        Section {sectionIndex + 1}: {section.title}
                      </h4>
                      <p className="text-xs">
                        {section.lectureCount} • {section.duration}
                      </p>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`transition-all ${
                        expandedSections.includes(sectionIndex)
                          ? "rotate-180"
                          : ""
                      }`}
                    />
                  </button>

                  {expandedSections.includes(sectionIndex) && (
                    <div className="bg-gray-50">
                      {section.chapters?.map((ch, chIndex) => {
                        const isActive = chapter === ch;
                        const isCompleted = completedChapters.includes(
                          ch.title || "",
                        );

                        return (
                          <button
                            key={`chapter-${sectionIndex}-${chIndex}`}
                            onClick={() => {
                              onSelectChapter(ch);
                              // close sidebar on mobile after selecting
                              if (sidebarOpen) setSidebarOpen(false);
                            }}
                            className={`w-full text-left p-3 pl-4 sm:pl-6 flex items-center gap-2 sm:gap-3 hover:bg-blue-50 transition-all relative ${
                              isActive
                                ? "text-blue-500 border-r-8 border-blue-400"
                                : ""
                            }`}
                          >
                            <div className="flex-shrink-0">
                              {isCompleted ? (
                                <CheckIcon
                                  size={16}
                                  className="text-green-600"
                                />
                              ) : ch.type === "quiz" ||
                                ch.type === "assignment" ? (
                                <Brain size={16} className="text-blue-600" />
                              ) : (
                                <Play
                                  size={16}
                                  className={isActive ? "text-blue-600" : ""}
                                />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm truncate ${
                                  isActive ? "font-medium" : ""
                                }`}
                              >
                                {ch.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1 text-xs">
                                {ch.type === "quiz" ||
                                ch.type === "assignment" ? (
                                  <span className="text-blue-600">
                                    Score: {scores[ch.testId ?? ""] ?? 0}
                                  </span>
                                ) : (
                                  <span>{ch.duration}</span>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>
        {/* backdrop for mobile when sidebar open */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-40 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>

      {/* handle quiz - responsive modal */}
      {quizOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] shadow-lg p-6 overflow-y-auto border border-gray-200">
            {!quizResults ? (
              <>
                <h2 className="text-2xl sm:text-3xl font-semibold mb-4 text-center text-gray-900 tracking-tight">
                  Quick Knowledge Check
                </h2>

                <div className="space-y-4">
                  {quizQuestions.map((q, i) => (
                    <div
                      key={i}
                      className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                    >
                      <p className="font-medium text-gray-800 mb-3 text-base sm:text-lg">
                        {i + 1}. {q.question}
                      </p>

                      <div className="grid grid-cols-1 gap-3">
                        {q.options.map((opt: any, idx: number) => {
                          const optionLetter = String.fromCharCode(65 + idx);
                          const active = userAnswers[i] === optionLetter;
                          return (
                            <button
                              key={idx}
                              onClick={() => handleAnswer(i, idx)}
                              className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                                active
                                  ? "bg-blue-600 border-blue-600 text-white"
                                  : "bg-white border-gray-300 hover:bg-gray-100"
                              }`}
                            >
                              {optionLetter}. {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-center">
                  <button
                    onClick={submitQuiz}
                    className="bg-blue-600 hover:bg-blue-400 text-white font-semibold px-6 py-2 rounded-lg shadow-sm transition-colors text-base"
                  >
                    Submit Quiz
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl sm:text-3xl font-semibold mb-4 text-center text-gray-900 tracking-tight">
                  Your Results
                </h2>
                <p className="mb-4 text-center text-lg">
                  Score:{" "}
                  <span className="font-bold text-green-600">
                    {quizResults.score}/{quizQuestions.length}
                  </span>
                </p>

                <div className="space-y-3">
                  {quizResults.answers.map((a, i) => (
                    <div key={i} className="p-3 rounded-lg border bg-gray-50">
                      <p className="font-medium text-gray-800 mb-1">
                        {a.question}
                      </p>
                      <p>
                        Your Answer:{" "}
                        <span
                          className={`${
                            a.isCorrect ? "text-green-600" : "text-blue-600"
                          } font-semibold`}
                        >
                          {a.userAnswer || "Not answered"}
                        </span>
                      </p>
                      {!a.isCorrect && (
                        <p className="text-gray-600">
                          Correct Answer:{" "}
                          <span className="font-semibold">
                            {a.correctAnswer}
                          </span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-center">
                  <button
                    onClick={() => {
                      setQuizOpen(false);
                      setQuizResults(null);
                      setUserAnswers({});
                      goToNextChapter();
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg shadow-sm text-base transition-colors"
                  >
                    Continue to Next Chapter
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {loadingQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="text-white text-xl animate-pulse">
            Loading Quiz...
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseLearningPage;
