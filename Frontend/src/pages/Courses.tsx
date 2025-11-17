/* eslint-disable */
import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import FilterPanel from "../components/common/FilterPannel";
import { Eye, Filter, LayoutGrid, List, TagIcon } from "lucide-react";
import { SortDropdown } from "../components/common/SortDropDown";
import type { CourseData } from "../types/course";
// import { useSelector } from "react-redux";
// import type { RootState } from "../store";
import AddToCartButton from "../components/funui/AddToCartButton";
import { useCourses } from "../hooks/queries/courses";
import getThumbnailUrl from "@/utils/getThumbnailUrl";
import ExpertProfessionals from "./ExpertProfessionals";

type ViewMode = "grid" | "list";

const getPrice = (c: CourseData): number => {
  const raw = (c as any)?.discountPrice ?? (c as any)?.price ?? "0";
  const n = typeof raw === "number" ? raw : parseFloat(String(raw));
  return Number.isFinite(n) ? n : 0;
};

const getRating = (c: CourseData): number => {
  const cr = (c as any)?.rating;
  if (typeof cr === "number") return cr;
  const ir = c.instructor?.[0]?.rating;
  return typeof ir === "number" ? ir : 0;
};

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
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const [currentSort, setCurrentSort] = useState<string>("popularity");
  const [filters, setFilters] = useState<any>({
    subjects: [],
    difficulties: [],
    priceRanges: [],
    durations: [],
    ratings: [],
  });

  // const cartItems = useSelector((state: RootState) => state.cart.items);

  useEffect(() => {
    setFilteredCourses(courses);
  }, [courses]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("search") || "";
    if (q) {
      setSearchQuery(q);
      applyFilters(q, filters, currentSort);
    }
  }, [courses]);

  // const handleSearch = (query: string) => {
  //   setSearchQuery(query);
  //   applyFilters(query, filters, currentSort);

  //   const params = new URLSearchParams(window.location.search);
  //   if (query) {
  //     params.set("search", query);
  //   } else {
  //     params.delete("search");
  //   }
  //   window.history.replaceState({}, "", `?${params.toString()}`);
  // };

  const handleSortChange = (sortValue: string) => {
    setCurrentSort(sortValue);
    applyFilters(searchQuery, filters, sortValue);
  };

  const handleFilterChange = (
    type: string,
    value?: string,
    checked?: boolean
  ) => {
    if (type === "clear-all") {
      const cleared = {
        subjects: [],
        difficulties: [],
        priceRanges: [],
        durations: [],
        ratings: [],
      };
      setFilters(cleared);
      applyFilters(searchQuery, cleared, currentSort);
      return;
    }

    const updated = { ...filters };
    if (value) {
      if (checked) {
        updated[type] = [...(updated[type] || []), value];
      } else {
        updated[type] = (updated[type] || []).filter(
          (v: string) => v !== value
        );
      }
    }
    setFilters(updated);
    applyFilters(searchQuery, updated, currentSort);
  };

  const applyFilters = (query: string, filtersData: any, sortValue: string) => {
    let results = [...courses];

    if (query) {
      const q = query.toLowerCase();
      results = results.filter((c) => {
        const inTitle = c.title?.toLowerCase().includes(q);
        const inCategory = (c as any).category?.toLowerCase?.().includes(q);
        const inInstructors = getInstructorNames(c).toLowerCase().includes(q);
        const inTechs = (c.technologies ?? []).some((t) =>
          String(t).toLowerCase().includes(q)
        );
        return inTitle || inCategory || inInstructors || inTechs;
      });
    }

    if (filtersData.subjects?.length) {
      results = results.filter((c) =>
        filtersData.subjects.includes((c as any).category)
      );
    }

    if (filtersData.difficulties?.length) {
      results = results.filter((c) =>
        filtersData.difficulties.includes(c.difficulty)
      );
    }

    switch (sortValue) {
      case "price-low":
        results.sort((a, b) => getPrice(a) - getPrice(b));
        break;
      case "price-high":
        results.sort((a, b) => getPrice(b) - getPrice(a));
        break;
      case "newest":
        results.sort(
          (a, b) =>
            new Date((b as any)?.createdAt ?? 0).getTime() -
            new Date((a as any)?.createdAt ?? 0).getTime()
        );
        break;
      case "rating":
        results.sort((a, b) => getRating(b) - getRating(a));
        break;
      default:
        break;
    }

    setFilteredCourses(results);
  };

  const renderedCourses = useMemo(() => filteredCourses, [filteredCourses]);

  return (
    <div className="min-h-screen flex flex-col items-center mt-10 text-gray-900 font-Quick mb-20">
      <ExpertProfessionals />
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t py-8 border-zinc-200 w-full px-4 sm:px-6 lg:px-16 max-w-6xl mt-10">
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="group flex items-center justify-center sm:justify-start gap-2.5 px-4 py-2 rounded-lg border  hover:bg-red-50 transition"
          style={{ borderColor: "#C21817" }}
        >
          <Filter size={18} className="text-red-600" />
          <span className="text-sm font-medium">
            {isFilterOpen ? "Hide Filters" : "Show Filters"}
          </span>
        </button>

        <div className="flex items-center justify-between sm:justify-end gap-4">
          {/* View Mode Toggles */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-all ${
                viewMode === "grid"
                  ? "bg-lime-700 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-all ${
                viewMode === "list"
                  ? "bg-lime-700 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <List size={18} />
            </button>
          </div>

          {/* Sort Dropdown */}
          <SortDropdown
            currentSort={currentSort}
            onSortChange={handleSortChange}
          />
        </div>
      </div>
      {/* Main Content Area */}
      <main className="w-full px-4 sm:px-6 lg:px-16 mt-6 lg:mt-10 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filter Sidebar */}
          <aside
            className={`${isFilterOpen ? "block lg:col-span-1" : "hidden"}`}
          >
            <div className="lg:sticky lg:top-6">
              <FilterPanel
                filters={filters}
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
              <div
                className={`${
                  viewMode === "grid"
                    ? `grid gap-4  sm:gap-6 ${
                        isFilterOpen
                          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
                          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                      }`
                    : "flex flex-col gap-4"
                }`}
              >
                {renderedCourses.map((course) => {
                  const thumbUrl = getThumbnailUrl(course);
                  const names = getInstructorNames(course);
                  // const price = getPrice(course);

                  return (
                    course.isPublished && (
                      <div
                        key={course.id}
                        className={`overflow-hidden transition-all group ${
                          viewMode === "list"
                            ? "flex flex-col sm:flex-row items-start gap-4 p-4 sm:p-6"
                            : ""
                        }`}
                      >
                        <Link
                          to={`/course-details/${course.id}`}
                          className="block relative overflow-hidden"
                        >
                          <img
                            src={thumbUrl}
                            alt={course.title}
                            className={`object-cover transition-transform max-w-sm duration-300 group-hover:scale-105 ${
                              viewMode === "list"
                                ? "w-full h-32 sm:h-52 rounded-lg"
                                : "w-full h-48 sm:h-52"
                            }`}
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Eye className="text-white h-11 w-11" />
                          </div>
                        </Link>

                        <div
                          className={`py-4 px-2 flex max-w-lg flex-col justify-between ${
                            viewMode === "list"
                              ? "flex-1 min-h-0 p-0 sm:p-0"
                              : "min-h-[180px]"
                          }`}
                        >
                          <div className="flex-1">
                            <Link to={`/course-details/${course.id}`}>
                              <h2 className="text-base sm:text-md font-semibold line-clamp-2 mb-1">
                                {course.title}
                              </h2>
                              <p className="text-xs sm:text-sm text-gray-500 mb-1">
                                By {names || "Instructor"}
                              </p>
                              {viewMode === "list" && (
                                <>
                                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                    {course.shortDescription}
                                  </p>
                                </>
                              )}
                            </Link>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pt-1">
                            {/* <div className="flex items-center gap-2 mb-2">
                              <span className="font-bold text-base sm:text-lg">
                                ₹{price.toFixed(2)}
                              </span>
                              {course.price > 0 &&
                                course.discountPrice &&
                                course.discountPrice < course.price && (
                                  <del className="text-sm text-gray-500">
                                    ₹{course.price}
                                  </del>
                                )}
                            </div> */}
                            {viewMode === "list" && (
                              <span className="bg-gray-200 flex items-center flex-row rounded-xl px-2">
                                <TagIcon className="h-3" />
                                {course.difficulty}
                              </span>
                            )}
                          </div>
                          <AddToCartButton course={course} />
                        </div>
                      </div>
                    )
                  );
                })}
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
