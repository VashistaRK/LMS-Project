/* eslint-disable */
import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import FilterPanel from "../components/common/FilterPannel";
import { ChevronRight, CodeXmlIcon, Filter, Option } from "lucide-react";
import type { CourseData } from "../types/course";
import ActionButton from "../components/funui/AddTo-Button";
import { useCourses } from "../hooks/queries/courses";
import getThumbnailUrl from "@/utils/getThumbnailUrl";
import ExpertProfessionals from "./ExpertProfessionals";
import { FaEye } from "react-icons/fa";
import { IoPricetagsSharp } from "react-icons/io5";

const getInstructorNames = (c: CourseData): string =>
  (c.instructor ?? [])
    .map((i: any) => i?.name)
    .filter(Boolean)
    .join(", ");

const CourseCatalog: React.FC = () => {
  const { data: courses = [], isLoading } = useCourses();
  const [filteredCourses, setFilteredCourses] = useState<CourseData[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [filter, setFilter] = useState<"subjects" | "difficulties">("subjects");

  const [filters, setFilters] = useState<any>({
    subjects: [],
    difficulties: [],
  });

  useEffect(() => {
    setFilteredCourses(courses);
    console.log("Courses loaded:", courses);
  }, [courses]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("search") || "";
    if (q) {
      setSearchQuery(q);
      applyFilters(q, filters);
    }
  }, [courses]);

  const handleFilterChange = (
    type: string,
    value?: string,
    checked?: boolean,
  ) => {
    if (type === "clear-all") {
      const cleared = {
        subjects: [],
        difficulties: [],
      };
      setFilters(cleared);
      applyFilters(searchQuery, cleared);
      return;
    }

    const updated = { ...filters };
    if (value) {
      if (checked) {
        updated[type] = [...(updated[type] || []), value];
      } else {
        updated[type] = (updated[type] || []).filter(
          (v: string) => v !== value,
        );
      }
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
        const inTechs = (c.technologies ?? []).some((t) =>
          String(t).toLowerCase().includes(q),
        );
        return inTitle || inCategory || inInstructors || inTechs;
      });
    }

    if (filtersData.subjects?.length) {
      results = results.filter((c) =>
        filtersData.subjects.includes((c as any).category),
      );
    }

    if (filtersData.difficulties?.length) {
      results = results.filter((c) =>
        filtersData.difficulties.includes(c.difficulty),
      );
    }

    setFilteredCourses(results);
  };

  const setFilterAndApply = (value: "subjects" | "difficulties") => {
    setFilter(value);
    setIsFilterOpen(!isFilterOpen);
  };

  const renderedCourses = useMemo(() => filteredCourses, [filteredCourses]);

  return (
    <div className="min-h-screen py-12 max-w-7xl mx-4 xl:mx-auto flex flex-col items-center text-slate-900 font-Quick pb-24">
      <ExpertProfessionals />
      {/* Controls Bar */}
      <div
        id="courses"
        className="w-full mt-16 flex flex-col md:flex-row items-center gap-6"
      >
        <button
          onClick={() => setFilterAndApply("subjects")}
          className="group w-full xl:w-1/3 flex flex-col items-center py-12 rounded-lg border border-slate-300
             hover:bg-zinc-300 bg-zinc-200 text-sm font-medium"
        >
          <CodeXmlIcon className="h-24 w-24 mb-8 group-hover:text-white p-1" />
          <Filter size={18} className="text-slate-700" />
          <p className="text-zinc-600">Filter</p>
          <h5 className="text-zinc-800 text-lg font-bold">By language.</h5>
        </button>
        <button className="w-1/3 flex items-center justify-center text-zinc-800 text-lg font-bold">
          <ChevronRight />
          Then
          <ChevronRight />
        </button>
        <button
          onClick={() => setFilterAndApply("difficulties")}
          className="group w-full xl:w-1/3 flex flex-col items-center py-12 rounded-lg border border-slate-300
             hover:bg-zinc-300 bg-zinc-200 text-sm font-medium"
        >
          <Option className="h-24 w-24 text-white group-hover:text-black mb-8 p-1" />
          <Filter size={18} className="text-slate-700" />
          <p className="text-zinc-600">Filter</p>
          <h5 className="text-zinc-800 text-lg font-bold">By Level.</h5>
        </button>
      </div>
      {/* Main Content Area */}
      <main className="w-full mt-10">
        <div className="max-w-7xl mx-auto gap-8">
          {/* Filter Sidebar */}
          <aside className={`${isFilterOpen ? "block lg:relative" : "hidden"}`}>
            <div className="sticky top-24">
              <FilterPanel
                filters={filters}
                filterOption={filter}
                onFilterChange={handleFilterChange}
              />
            </div>
          </aside>

          {/* Course Grid/List */}
          <section
            className={`${isFilterOpen ? "lg:col-span-3" : "lg:col-span-4"}`}
          >
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-200 border-t-red-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading courses...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-12 mt-12">
                <header className="font-mulish font-bold leading-tight tracking-tight">
                  <h2 className="text-2xl text-gray-900">Available Courses.</h2>
                </header>
                <div
                  className={`grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`}
                >
                  {renderedCourses.map((course) => {
                    const thumbUrl = getThumbnailUrl(course);
                    return (
                      course.isPublished && (
                        <div
                          key={course.id}
                          className={`overflow-hidden transition-all group`}
                        >
                          <Link
                            to={`/course-details/${course.id}`}
                            className="block rounded-2xl relative overflow-hidden"
                          >
                            <img
                              src={thumbUrl}
                              alt={course.title}
                              className={`object-cover rounded-2xl transition-transform duration-300 group-hover:scale-105`}
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <FaEye className="text-white h-11 w-11" />
                            </div>
                          </Link>

                          <div
                            className={`py-4 px-2 flex max-w-lg flex-col justify-between"min-h-[180px]`}
                          >
                            <div className="flex-1">
                              <Link to={`/course-details/${course.id}`}>
                                <h2 className="text-base sm:text-md font-semibold line-clamp-2 mb-1">
                                  {course.title}
                                </h2>
                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                  {course.shortDescription}
                                </p>
                              </Link>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:justify-end sm:items-end gap-3 pb-4">
                              <span className="bg-[#9CCFFF] flex items-center justify-center text-zinc-700 rounded-md font-semibold flex-row px-2 uppercase">
                                <IoPricetagsSharp className="h-3 pr-1" />
                                {course.difficulty}
                              </span>
                            </div>
                            <ActionButton course={course} />
                          </div>
                        </div>
                      )
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && renderedCourses.length === 0 && (
              <div className="text-center py-20">
                <div className="text-gray-400 mb-4">
                  <svg
                    className="w-16 h-16 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No courses found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default CourseCatalog;
