/* eslint-disable */
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchPurchasedCourses, fetchCoursesByIds } from "../services/userApi";
import type { CourseData } from "../types/course";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Play,
  Sparkles,
  Award,
  Zap,
} from "lucide-react";
import { useAuthContext } from "../context/AuthProvider";
import getThumbnailUrl from "@/utils/getThumbnailUrl";
import { IoPricetagsSharp } from "react-icons/io5";

const MyLearning: React.FC<{ userId: string }> = ({ userId }) => {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<
    (CourseData & {
      progress: number;
      status: "Not Started" | "In Progress" | "Completed";
    })[]
  >([]);
  const [ContinueLearning, setContinueLearning] = useState<
    (CourseData & { progress: number; status: "In Progress" })[]
  >([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const { user } = useAuthContext();

  const getCourseId = (c: CourseData) => (c as any).id ?? (c as any)._id ?? "";

  const getTotalChapters = (course: CourseData) => {
    if (Array.isArray((course as any).sections)) {
      return (course as any).sections.reduce(
        (acc: number, s: any) => acc + (s.chapters?.length ?? 0),
        0,
      );
    }
    return (course as any).chapters?.length ?? 0;
  };

  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      try {
        const purchased = await fetchPurchasedCourses(userId);
        const rawCourses = await fetchCoursesByIds(purchased);

        const enriched = (rawCourses || []).map((course: CourseData) => {
          const courseId = getCourseId(course);
          const purchasedItem = (purchased || []).find(
            (p: any) => String(p.CourseId) === String(courseId),
          );

          const total = getTotalChapters(course);
          const completed = Array.isArray(purchasedItem?.completedChapters)
            ? purchasedItem.completedChapters.length
            : 0;
          const rawProgress = total ? Math.round((completed / total) * 100) : 0;
          const progress = Math.min(100, Math.max(0, rawProgress));
          const status: "Not Started" | "In Progress" | "Completed" =
            progress === 0
              ? "Not Started"
              : progress === 100
                ? "Completed"
                : "In Progress";

          return { ...(course as any), progress, status };
        });

        setCourses(enriched);
        setContinueLearning(
          enriched.filter(
            (c: { status: string }) => c.status === "In Progress",
          ),
        );
      } catch (err) {
        console.error("Failed to load courses:", err);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    if (userId) loadCourses();
  }, [userId]);

  const totalPages = Math.max(1, Math.ceil(courses.length / pageSize));

  const totalProgress = courses.reduce((acc, c) => acc + (c.progress || 0), 0);
  const completionRate =
    courses.length > 0 ? Math.round(totalProgress / courses.length) : 0;

  const completedCourses = courses.filter(
    (c) => c.status === "Completed",
  ).length;

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[70vh] bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-slate-800 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 font-medium">
            Loading your courses...
          </p>
        </div>
      </div>
    );

  if (!courses.length)
    return (
      <div className="flex justify-center items-center min-h-[70vh] bg-gray-50">
        <div className="text-center p-8">
          <BookOpen className="w-20 h-20 text-gray-800 mx-auto mb-4" />
          <p className="text-gray-700 text-xl font-medium">
            Ready to start your learning journey?
          </p>
          <p className="text-gray-500 mt-2">Explore courses and begin today!</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen pb-16 font-mulish">
      <div className="max-w-7xl mx-4 lg:mx-6 xl:mx-auto">
        {/* ---------------- HERO SECTION ---------------- */}
        <header className="relative overflow-hidden">
          <div className="relative py-24 xl:py-32 z-10 flex flex-col lg:flex-row justify-between items-center gap-8">
            {/* Left Text */}
            <aside className="flex flex-col justify-center text-center lg:text-left max-w-xl">
              <div className="flex items-center gap-2 justify-center lg:justify-start mb-3">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span className="text-gray-800 font-medium text-sm uppercase tracking-wider">
                  Your Learning Hub
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-3">
                Welcome back
                <br /> {user?.name || "Learner"}!
              </h1>
              <p className="text-gray-700 text-2xl sm:text-4xl font-bold mb-6">
                Track your progress and continue your learning journey
              </p>

              {/* Stats Row */}
              <div className="flex gap-8 mt-6 justify-center lg:justify-start flex-wrap">
                <div className="rounded-2xl">
                  <div className="flex items-start gap-3">
                    <div className="p-2">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <div className="text-2xl font-bold">{courses.length}</div>
                      <div className="text-xs text-gray-800">Total Courses</div>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl">
                  <div className="flex items-start gap-3">
                    <div className="p-2">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <div className="text-2xl font-bold">
                        {ContinueLearning.length}
                      </div>
                      <div className="text-xs text-gray-800">Active</div>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl">
                  <div className="flex items-start gap-3">
                    <div className="p-2">
                      <Award className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <div className="text-2xl font-bold">
                        {completedCourses}
                      </div>
                      <div className="text-xs text-gray-800">Completed</div>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Circular Progress */}
            <aside className="relative flex items-center justify-center">
              <div className="relative">
                <svg className="w-44 h-44 -rotate-90 drop-shadow-2xl">
                  <circle
                    className="text-black"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r="66"
                    cx="88"
                    cy="88"
                  />
                  <circle
                    className="text-blue-400 transition-all duration-1000 ease-out"
                    strokeWidth="10"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="66"
                    cx="88"
                    cy="88"
                    strokeDasharray={2 * Math.PI * 66}
                    strokeDashoffset={
                      2 * Math.PI * 66 * (1 - completionRate / 100)
                    }
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold">{completionRate}%</span>
                  <span className="text-xs text-gray-800 mt-1">Progress</span>
                </div>
              </div>
            </aside>
          </div>
        </header>

        {/* ---------------- WHATSAPP FLOATING BUTTON ---------------- */}
        <a
          href="https://chat.whatsapp.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-full shadow-2xl flex items-center justify-center transition-all transform hover:scale-110 duration-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
            className="w-7 h-7"
          >
            <path d="M20.52 3.48A11.87 11.87 0 0012 0a11.87 11.87 0 00-8.52 3.48A11.87 11.87 0 000 12a11.87 11.87 0 001.64 6L0 24l6.2-1.63A11.87 11.87 0 0012 24a11.87 11.87 0 008.52-3.48A11.87 11.87 0 0024 12a11.87 11.87 0 00-3.48-8.52zM12 22a9.93 9.93 0 01-5.06-1.39l-.36-.21-3.68.97 1-3.51-.23-.37A9.92 9.92 0 1122 12a10 10 0 01-10 10zm5.12-7.23c-.28-.14-1.64-.81-1.89-.9s-.44-.14-.63.14-.72.9-.89 1.09-.33.21-.61.07a8.14 8.14 0 01-2.39-1.47 9 9 0 01-1.66-2.07c-.17-.28 0-.43.13-.57s.28-.33.42-.5a1.91 1.91 0 00.28-.47.51.51 0 000-.48c-.07-.14-.63-1.5-.86-2.06s-.46-.48-.63-.49h-.54a1 1 0 00-.71.33 3 3 0 00-.93 2.22 5.28 5.28 0 001.11 2.83 12.06 12.06 0 009.39 5.6 2.66 2.66 0 001.81-.74 2.21 2.21 0 00.5-1.41c0-.38-.05-.61-.23-.75s-.49-.21-.77-.35z" />
          </svg>
        </a>

        {/* ----------- CONTINUE LEARNING SECTION ----------- */}
        {ContinueLearning.length > 0 && (
          <section className="mb-10">
            <h2 className="text-2xl mb-2 sm:text-3xl font-bold tracking-tight">
              Continue Learning
            </h2>
            <p className="mb-12 leading-tight tracking-tight text-xl font-semibold text-zinc-500 max-w-2xl">
              Gain a complete understanding of what these courses offers, key
              objectives, and the unique approach used to teach essential skills
              for your chosen field`s success.
            </p>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {ContinueLearning.map((course) => {
                const thumbUrl = getThumbnailUrl(course);
                return (
                  <Link
                    key={getCourseId(course)}
                    to={`/my-courses/${getCourseId(course)}`}
                    className="group block rounded-md overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={thumbUrl}
                        alt={course.title}
                        className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="bg-white rounded-full p-4 transform scale-75 group-hover:scale-100 transition-transform shadow-2xl">
                          <Play className="w-8 h-8 text-slate-800" />
                        </div>
                      </div>
                      <div className="absolute top-3 right-3 bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
                        {course.progress}%
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-slate-700 transition-colors">
                        {course.title}
                      </h3>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-md border border-amber-200">
                          In Progress
                        </span>
                        <span className="bg-[#9CCFFF] flex items-center justify-center text-zinc-700 rounded-md font-semibold flex-row px-2 uppercase">
                          <IoPricetagsSharp className="h-3 pr-1" />
                          {course.difficulty}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-slate-800 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ---------------- PAGINATION ---------------- */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-12 gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-3 bg-white hover:bg-gray-50 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm border border-gray-200"
            >
              <ChevronLeft className="text-slate-800" />
            </button>

            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-4 py-2 font-semibold rounded-xl transition-all ${
                    currentPage === i + 1
                      ? "bg-slate-800 text-white shadow-md"
                      : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-3 bg-white hover:bg-gray-50 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm border border-gray-200"
            >
              <ChevronRight className="text-slate-800" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLearning;
