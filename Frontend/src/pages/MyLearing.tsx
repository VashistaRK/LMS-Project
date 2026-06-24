/* eslint-disable */
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchPurchasedCourses, fetchCoursesByIds } from "../services/userApi";
import type { CourseData } from "../types/course";
import { BookOpen, ChevronLeft, ChevronRight, Play, Award, Zap } from "lucide-react";
import { useAuthContext } from "../context/AuthProvider";
import getThumbnailUrl from "@/utils/getThumbnailUrl";
import { LightGlassBg } from "@/components/ui/light-glass-bg";
import { GlowCard } from "@/components/ui/spotlight-card";
import { motion } from "framer-motion";
import { PageHero } from "@/components/ui/page-hero";

const MyLearning: React.FC<{ userId: string }> = ({ userId }) => {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<(CourseData & { progress: number; status: "Not Started" | "In Progress" | "Completed" })[]>([]);
  const [ContinueLearning, setContinueLearning] = useState<(CourseData & { progress: number; status: "In Progress" })[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const { user } = useAuthContext();

  const getCourseId = (c: CourseData) => (c as any).id ?? (c as any)._id ?? "";
  const getTotalChapters = (course: CourseData) => {
    if (Array.isArray((course as any).sections)) return (course as any).sections.reduce((acc: number, s: any) => acc + (s.chapters?.length ?? 0), 0);
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
          const purchasedItem = (purchased || []).find((p: any) => String(p.CourseId) === String(courseId));
          const total = getTotalChapters(course);
          const completed = Array.isArray(purchasedItem?.completedChapters) ? purchasedItem.completedChapters.length : 0;
          const progress = Math.min(100, Math.max(0, total ? Math.round((completed / total) * 100) : 0));
          const status: "Not Started" | "In Progress" | "Completed" = progress === 0 ? "Not Started" : progress === 100 ? "Completed" : "In Progress";
          return { ...(course as any), progress, status };
        });
        setCourses(enriched);
        setContinueLearning(enriched.filter((c: { status: string }) => c.status === "In Progress"));
      } catch (err) { console.error("Failed to load courses:", err); setCourses([]); }
      finally { setLoading(false); }
    };
    if (userId) loadCourses();
  }, [userId]);

  const totalPages = Math.max(1, Math.ceil(courses.length / pageSize));
  const completedCourses = courses.filter((c) => c.status === "Completed").length;
  const totalProgress = courses.reduce((acc, c) => acc + (c.progress || 0), 0);
  const completionRate = courses.length > 0 ? Math.round(totalProgress / courses.length) : 0;

  if (loading)
    return (
      <LightGlassBg className="text-zinc-900">
        <div className="flex justify-center items-center min-h-[70vh]">
          <div className="w-12 h-12 border-4 border-zinc-700 border-t-[#6366F1] rounded-full animate-spin" />
        </div>
      </LightGlassBg>
    );

  if (!courses.length)
    return (
      <LightGlassBg className="text-zinc-900">
        <div className="flex justify-center items-center min-h-[70vh]">
          <div className="text-center p-8">
            <BookOpen className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <p className="font-satoshi text-xl font-bold text-zinc-200">Ready to start?</p>
            <p className="text-zinc-500 mt-2 font-dmsans">Explore courses and begin today!</p>
          </div>
        </div>
      </LightGlassBg>
    );

  return (
    <LightGlassBg className="text-zinc-900">
      <main className="relative z-10 min-h-screen pt-28 pb-8 max-w-[1440px] mx-auto px-6">
        {/* Hero */}
        <PageHero
          label="My Learning"
          title={<>Welcome back,<br />{user?.name || "Learner"}<span className="text-[#6366F1]">.</span></>}
          subtitle="Track your progress and continue your learning journey."
        >
          <div className="flex flex-wrap gap-6 mt-4">
            {[
              { icon: <BookOpen className="w-5 h-5 text-[#6366F1]" />, val: courses.length, label: "TOTAL" },
              { icon: <Zap className="w-5 h-5 text-amber-400" />, val: ContinueLearning.length, label: "ACTIVE" },
              { icon: <Award className="w-5 h-5 text-[#4edea3]" />, val: completedCourses, label: "DONE" },
              { icon: null, val: `${completionRate}%`, label: "PROGRESS" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2">
                {s.icon}
                <span className="font-satoshi text-2xl font-bold text-white">{s.val}</span>
                <span className="font-jetbrains text-[10px] text-zinc-500 uppercase">{s.label}</span>
              </div>
            ))}
          </div>
        </PageHero>

        {/* Continue Learning */}
        {ContinueLearning.length > 0 && (
          <section className="mb-16">
            <h2 className="font-satoshi text-2xl font-bold text-white mb-2">Continue Learning</h2>
            <p className="text-zinc-500 font-dmsans mb-8">Pick up where you left off.</p>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {ContinueLearning.map((course, idx) => {
                const thumbUrl = getThumbnailUrl(course);
                return (
                  <motion.div
                    key={getCourseId(course)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link to={`/my-courses/${getCourseId(course)}`}>
                      <GlowCard glowColor="purple" customSize className="!aspect-auto !p-0 group">
                        <div className="relative z-10">
                          <div className="relative overflow-hidden rounded-t-2xl h-44">
                            <img src={thumbUrl} alt={course.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <div className="bg-white/10 backdrop-blur-md rounded-full p-3">
                                <Play className="w-6 h-6 text-white" />
                              </div>
                            </div>
                            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white font-jetbrains text-xs px-2.5 py-1 rounded-full">
                              {course.progress}%
                            </div>
                          </div>
                          <div className="p-5">
                            <h3 className="font-satoshi font-bold text-zinc-100 mb-3 line-clamp-2">{course.title}</h3>
                            <div className="flex items-center justify-between mb-3">
                              <span className="font-jetbrains text-[10px] uppercase text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">In Progress</span>
                              <span className="font-jetbrains text-[10px] uppercase text-[#6366F1] bg-[#6366F1]/10 border border-[#6366F1]/20 px-2 py-0.5 rounded-full">{course.difficulty}</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/40 rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${course.progress}%`, background: "linear-gradient(90deg, #6366F1, #4edea3)" }} />
                            </div>
                          </div>
                        </div>
                      </GlowCard>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-12 gap-3">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-2.5 border border-white/50 rounded-lg text-zinc-600 hover:bg-white/40 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-jetbrains text-xs text-zinc-500">
              Page <span className="text-zinc-200">{currentPage}</span> / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2.5 border border-white/50 rounded-lg text-zinc-600 hover:bg-white/40 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </main>
    </LightGlassBg>
  );
};

export default MyLearning;
