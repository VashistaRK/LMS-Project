/* eslint-disable */
import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import FilterPanel from "../components/common/FilterPannel";
import { Filter, Search, BookOpen } from "lucide-react";
import type { CourseData } from "../types/course";
import ActionButton from "../components/funui/AddTo-Button";
import { useCourses } from "../hooks/queries/courses";
import getThumbnailUrl from "@/utils/getThumbnailUrl";
import { DarkGradientBg } from "@/components/ui/elegant-dark-pattern";
import { GlowCard } from "@/components/ui/spotlight-card";
import { motion } from "framer-motion";
import { PageHero } from "@/components/ui/page-hero";

const getInstructorNames = (c: CourseData): string =>
  (c.instructor ?? []).map((i: any) => i?.name).filter(Boolean).join(", ");

const CourseCatalog: React.FC = () => {
  const { data: courses = [], isLoading } = useCourses();
  const [filteredCourses, setFilteredCourses] = useState<CourseData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filter, setFilter] = useState<"subjects" | "difficulties">("subjects");
  const [filters, setFilters] = useState<any>({ subjects: [], difficulties: [] });

  useEffect(() => { setFilteredCourses(courses); }, [courses]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("search") || "";
    if (q) { setSearchQuery(q); applyFilters(q, filters); }
  }, [courses]);

  const handleFilterChange = (type: string, value?: string, checked?: boolean) => {
    if (type === "clear-all") {
      const cleared = { subjects: [], difficulties: [] };
      setFilters(cleared);
      applyFilters(searchQuery, cleared);
      return;
    }
    const updated = { ...filters };
    if (value) {
      if (checked) updated[type] = [...(updated[type] || []), value];
      else updated[type] = (updated[type] || []).filter((v: string) => v !== value);
    }
    setFilters(updated);
    applyFilters(searchQuery, updated);
  };

  const applyFilters = (query: string, filtersData: any) => {
    let results = [...courses];
    if (query) {
      const q = query.toLowerCase();
      results = results.filter((c) => {
        const inTitle = c.title?.toLowerCase().includes(q);
        const inCategory = (c as any).category?.toLowerCase?.().includes(q);
        const inInstructors = getInstructorNames(c).toLowerCase().includes(q);
        const inTechs = (c.technologies ?? []).some((t) => String(t).toLowerCase().includes(q));
        return inTitle || inCategory || inInstructors || inTechs;
      });
    }
    if (filtersData.subjects?.length) results = results.filter((c) => filtersData.subjects.includes((c as any).category));
    if (filtersData.difficulties?.length) results = results.filter((c) => filtersData.difficulties.includes(c.difficulty));
    setFilteredCourses(results);
  };

  const renderedCourses = useMemo(() => filteredCourses, [filteredCourses]);

  const difficultyBadge = (d: string) => {
    const map: Record<string, string> = {
      Beginner: "bg-[#c0c1ff]/10 text-[#c0c1ff] border-[#c0c1ff]/20",
      Intermediate: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      Advanced: "bg-red-500/10 text-red-400 border-red-500/20",
      Expert: "bg-[#4edea3]/10 text-[#4edea3] border-[#4edea3]/20",
    };
    return map[d] || map.Beginner;
  };

  return (
    <DarkGradientBg className="text-[#e5e1e4]">
      <main className="relative z-10 min-h-screen py-8 max-w-[1440px] mx-auto px-6">
        <PageHero
          label="COURSE_CATALOG"
          title={<>Learn Smarter<span className="text-[#c0c1ff]">.</span></>}
          subtitle="Build Real Skills. Launch Your Tech Career."
        >
          <a href="/my-learning" className="inline-flex items-center gap-2 font-jetbrains text-xs text-[#c0c1ff] uppercase tracking-[0.2em] mb-6 border-b border-[#c0c1ff]/30 pb-1 hover:border-[#c0c1ff] transition-colors">
            My Learnings <span className="text-sm">↗</span>
          </a>
          <div className="border-l-2 border-[#c0c1ff]/30 pl-6 mb-8 max-w-2xl">
            <p className="font-jetbrains text-sm text-zinc-300 uppercase tracking-wide leading-relaxed mb-4">
              "The world will ask who you are, and if you do not know, the world will tell you."
            </p>
            <p className="font-dmsans text-sm text-zinc-500 leading-relaxed">
              Join a new-age learning platform designed for <span className="text-zinc-300 underline decoration-zinc-600">freshers, students, and passionate learners</span> who want more than just certificates. Learn directly from <span className="text-zinc-300 underline decoration-zinc-600">top IIT-trained educators and industry experts</span>, work on real-world projects, and gain the confidence to build, deploy, and succeed.
            </p>
          </div>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <span className="font-satoshi text-2xl font-bold text-white">120+</span>
              <span className="font-jetbrains text-[10px] text-zinc-500 uppercase">Courses</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="font-satoshi text-2xl font-bold text-white">50+</span>
              <span className="font-jetbrains text-[10px] text-zinc-500 uppercase">Topics</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="font-satoshi text-2xl font-bold text-white">4.8</span>
              <span className="font-jetbrains text-[10px] text-zinc-500 uppercase">Avg Rating</span>
            </div>
          </div>
        </PageHero>

        {/* Search + Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); applyFilters(e.target.value, filters); }}
              placeholder="Search courses..."
              className="w-full h-12 pl-12 pr-4 bg-white/5 border border-white/10 rounded-lg font-dmsans text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[#c0c1ff]/50 transition"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setFilter("subjects"); setIsFilterOpen(!isFilterOpen); }}
              className={`px-4 py-2 font-jetbrains text-xs uppercase tracking-[0.05em] border rounded-lg transition ${
                isFilterOpen && filter === "subjects" ? "bg-[#c0c1ff]/10 border-[#c0c1ff]/50 text-[#c0c1ff]" : "border-white/10 text-zinc-500 hover:text-zinc-200"
              }`}
            >
              <Filter className="w-3.5 h-3.5 inline mr-1.5" />By Language
            </button>
            <button
              onClick={() => { setFilter("difficulties"); setIsFilterOpen(!isFilterOpen); }}
              className={`px-4 py-2 font-jetbrains text-xs uppercase tracking-[0.05em] border rounded-lg transition ${
                isFilterOpen && filter === "difficulties" ? "bg-[#c0c1ff]/10 border-[#c0c1ff]/50 text-[#c0c1ff]" : "border-white/10 text-zinc-500 hover:text-zinc-200"
              }`}
            >
              <Filter className="w-3.5 h-3.5 inline mr-1.5" />By Level
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {isFilterOpen && (
          <div className="mb-8 p-4 bg-white/5 border border-white/[0.08] rounded-xl backdrop-blur-xl">
            <FilterPanel filters={filters} filterOption={filter} onFilterChange={handleFilterChange} />
          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-zinc-700 border-t-[#c0c1ff] rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="font-satoshi text-xl font-bold text-white">
                Available Courses <span className="text-zinc-500 font-jetbrains text-sm ml-2">{renderedCourses.length}</span>
              </h2>
            </div>

            {/* Course Grid */}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {renderedCourses.map((course, idx) => {
                if (!course.isPublished) return null;
                const thumbUrl = getThumbnailUrl(course);
                return (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.04, 0.32), duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <GlowCard glowColor="blue" customSize className="!aspect-auto !p-0 group">
                      <div className="relative z-10">
                        <Link to={`/course-details/${course.id}`} className="block overflow-hidden rounded-t-2xl">
                          <div className="relative h-44 overflow-hidden">
                            <img
                              src={thumbUrl}
                              alt={course.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <BookOpen className="w-8 h-8 text-white" />
                            </div>
                          </div>
                        </Link>

                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full font-jetbrains text-[10px] uppercase border ${difficultyBadge(course.difficulty)}`}>
                              {course.difficulty}
                            </span>
                          </div>
                          <Link to={`/course-details/${course.id}`}>
                            <h3 className="font-satoshi text-base font-bold text-zinc-100 line-clamp-2 mb-1 hover:text-[#c0c1ff] transition-colors">
                              {course.title}
                            </h3>
                            <p className="font-dmsans text-xs text-zinc-500 line-clamp-2 mb-3">{course.shortDescription}</p>
                          </Link>
                          <ActionButton course={course} />
                        </div>
                      </div>
                    </GlowCard>
                  </motion.div>
                );
              })}
            </div>

            {/* Empty */}
            {renderedCourses.length === 0 && (
              <div className="text-center py-20">
                <BookOpen className="w-16 h-16 mx-auto text-zinc-600 mb-4" />
                <h3 className="font-satoshi text-lg font-medium text-zinc-300 mb-2">No courses found</h3>
                <p className="text-zinc-500 font-dmsans">Try adjusting your search or filters</p>
              </div>
            )}
          </>
        )}
      </main>
    </DarkGradientBg>
  );
};

export default CourseCatalog;
