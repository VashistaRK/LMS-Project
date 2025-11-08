/* eslint-disable */
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchPurchasedCourses, fetchCoursesByIds } from "../services/userApi";
import type { CourseData } from "../types/course";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  PlayIcon,
} from "lucide-react";
import { useAuthContext } from "../context/AuthProvider";
import getThumbnailUrl from "@/utils/getThumbnailUrl";

const MyLearning: React.FC<{ userId: string }> = ({ userId }) => {
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [courses, setCourses] = useState<
    (CourseData & {
      progress: number;
      status: "Not Started" | "In Progress" | "Completed";
    })[]
  >([]);
  const [filter, setFilter] = useState<
    "All" | "Not Started" | "In Progress" | "Completed"
  >("All");
  const [ContinueLearning, setContinueLearning] = useState<
    (CourseData & { progress: number; status: "In Progress" })[]
  >([]);
  const [sortBy, setSortBy] = useState<"Title" | "Progress">("Title");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const { user } = useAuthContext();

  const getInstructorNames = (course: CourseData) =>
    (course.instructor || []).map((i: any) => i.name).join(", ");
  const getCourseId = (c: CourseData) => (c as any).id ?? (c as any)._id ?? "";

  const getTotalChapters = (course: CourseData) => {
    if (Array.isArray((course as any).sections)) {
      return (course as any).sections.reduce(
        (acc: number, s: any) => acc + (s.chapters?.length ?? 0),
        0
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
            (p: any) => String(p.CourseId) === String(courseId)
          );

          const total = getTotalChapters(course);
          const completed = Array.isArray(purchasedItem?.completedChapters)
            ? purchasedItem.completedChapters.length
            : 0;
          // protect against bad data where completed might be > total
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
          enriched.filter((c: { status: string }) => c.status === "In Progress")
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

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, sortBy, viewMode]);

  // filtering & sorting
  const filtered = useMemo(
    () =>
      courses.filter((c) => (filter === "All" ? true : c.status === filter)),
    [courses, filter]
  );

  const sorted = useMemo(() => {
    const copy = [...filtered];
    sortBy === "Title"
      ? copy.sort((a, b) => a.title.localeCompare(b.title))
      : copy.sort((a, b) => b.progress - a.progress);
    return copy;
  }, [filtered, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginatedCourses = sorted.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Overall completion as average of individual course progress (0-100)
  const totalProgress = courses.reduce((acc, c) => acc + (c.progress || 0), 0);
  const completionRate = courses.length > 0 ? Math.round(totalProgress / courses.length) : 0;

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <p className="text-lg text-gray-600 animate-pulse">Loading courses...</p>
      </div>
    );

  if (!courses.length)
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <p className="text-gray-500 text-lg">You haven’t enrolled in any courses yet.</p>
      </div>
    );

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto min-h-[90vh] mb-10">
      {/* ---------------- HERO SECTION ---------------- */}
      <header className="flex flex-col lg:flex-row justify-between items-center bg-red-50 text-red-900 w-full rounded-2xl mb-8 p-6 lg:px-10">
        {/* Left Text */}
        <aside className="flex flex-col justify-center text-center lg:text-left mb-6 lg:mb-0 max-w-xl">
          <h1 className="text-2xl sm:text-3xl font-semibold mb-2">
            Welcome {user?.name || "Learner"}! 👋
          </h1>
          <p className="text-gray-700">
            Here’s a quick look at your learning progress.
          </p>
        </aside>

        {/* Circular Progress */}
        <aside className="relative flex items-center justify-center">
          <svg className="w-40 h-40 -rotate-90">
            <circle
              className="text-gray-200"
              strokeWidth="10"
              stroke="currentColor"
              fill="transparent"
              r="60"
              cx="80"
              cy="80"
            />
              <circle
                className="text-red-500"
              strokeWidth="10"
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="60"
              cx="80"
              cy="80"
              strokeDasharray={2 * Math.PI * 60}
              strokeDashoffset={2 * Math.PI * 60 * (1 - completionRate / 100)}
            />
          </svg>
            <span className="absolute text-xl font-bold text-red-600">
            {completionRate}%
          </span>
        </aside>
      </header>

      {/* ----------- CONTINUE LEARNING SECTION ----------- */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold">Continue Learning</h2>
        </div>

        {ContinueLearning.length === 0 ? (
          <p className="text-gray-500">No courses in progress.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ContinueLearning.map((course) => {
              const thumbUrl = getThumbnailUrl(course);
              return (
                <Link
                  key={getCourseId(course)}
                  to={`/my-courses/${getCourseId(course)}`}
                  className="block p-4 group"
                >
                  <div className="relative group mb-3 w-full h-40 overflow-hidden">
                    <img
                      src={thumbUrl}
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <PlayIcon className="bg-white/90 rounded-full p-2 h-10 w-10" />
                    </div>
                  </div>
                  <h3 className="font-bold text-lg">{course.title}</h3>
                  <p className="text-sm text-gray-500">{course.status}</p>
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                    <div
                      className="bg-red-500 h-1 rounded-full transition-all"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {course.progress}% complete
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ---------------- FILTERS & CONTROLS ---------------- */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            My Learning
          </h1>
          <div className="ml-2 text-sm text-gray-600">
            {sorted.length} courses
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="p-2 rounded-lg border border-gray-300 text-gray-700 pr-8"
          >
            <option className="text-gray-700 hover:bg-red-100" value="Title">
              Sort by Title
            </option>
            <option className="text-gray-700 hover:bg-red-100" value="Progress">
              Sort by Progress
            </option>
          </select>

          <div className="hidden sm:flex gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded shadow ${
                viewMode === "grid" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600"
              }`}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded shadow ${
                viewMode === "list" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600"
              }`}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        {["All", "Not Started", "In Progress", "Completed"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status as any)}
            className={`px-3 py-1 rounded-xl transition ${
              filter === status
                ? "bg-red-500 text-white border-red-500"
                : "hover:bg-red-100"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* ---------------- COURSES GRID/LIST ---------------- */}
      <div className={`grid gap-6 mt-10 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
        {paginatedCourses.map((course) => {
          const thumbUrl = getThumbnailUrl(course);
          const instructorNames = getInstructorNames(course);
          return (
            <div key={getCourseId(course)}>
              <Link
                to={`/my-courses/${getCourseId(course)}`}
                className={`group block bg-white rounded-lg overflow-hidden shadow hover:shadow-md transition`}
              >
                <div className="relative group mb-3 w-full h-50 overflow-hidden">
                  <img
                    src={thumbUrl}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <PlayIcon className="bg-white/90 rounded-full p-2 h-10 w-10" />
                  </div>
                </div>

                <div
                  className={`${
                    viewMode === "grid" ? "p-2 sm:p-4" : "min-w-1/2 p-4 flex-1"
                  }`}
                >
                  <h2 className="text-lg max-w-80 font-semibold text-gray-800 mb-1 line-clamp-2">
                    {course.title}
                  </h2>
                  <p className="text-sm text-gray-500 mb-2">
                    {instructorNames || "Instructor"} • {course.difficulty ?? "All"} • {course.duration ?? ""}
                  </p>
                  {viewMode === "list" && (
                    <p className="text-gray-600 mb-2">{(course as any).shortDescription}</p>
                  )}
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                    <div className="bg-red-500 h-1 rounded-full transition-all" style={{ width: `${course.progress}%` }} />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {course.progress}% complete
                  </p>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      {/* ---------------- PAGINATION ---------------- */}
      {courses.length > pageSize && (
        <div className="flex justify-center mt-8 gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 hover:bg-red-100 rounded-full disabled:opacity-40"
          >
            <ChevronLeft />
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 font-bold py-1 rounded ${
                currentPage === i + 1
                  ? "bg-red-500 text-white"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 hover:bg-red-100 rounded-full disabled:opacity-40"
          >
            <ChevronRight />
          </button>
        </div>
      )}
    </div>
  );
};

export default MyLearning;
