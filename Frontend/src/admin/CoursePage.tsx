import { useEffect, useState } from "react";
import type { ComponentType } from "react";
import { coursesApi } from "../services/GlobalApi";
import { useNavigate } from "react-router";
import {
  Plus,
  BookOpen,
  Star,
  Filter,
  Search,
  Grid3X3,
  List,
  Eye,
  Edit3,
  DollarSign,
  Trash,
} from "lucide-react";
import type { CourseData } from "../types/course";

const colorMap: Record<string, { bg: string; text: string }> = {
  blue: { bg: "bg-red-50", text: "text-[#C21817]" },
  green: { bg: "bg-green-100", text: "text-green-600" },
  amber: { bg: "bg-amber-100", text: "text-amber-600" },
  purple: { bg: "bg-red-50", text: "text-[#C21817]" },
};

const CoursesPage = () => {
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data: CourseData[] = await coursesApi.getAll();
        setCourses(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleAddNewCourse = async () => {
    try {
      const newCourse = await coursesApi.create({
        title: "Untitled Course",
        description: "",
        isPublished: false,
      } as CourseData);

      // Make sure coursesApi.create returns the created object (with id)
      navigate(`/admin/course-management/${newCourse.id}`);
    } catch (err) {
      console.error("Failed to create new course:", err);
    }
  };

  const handleDelete = async (
    e: React.MouseEvent,
    courseId: string | undefined
  ) => {
    e.stopPropagation(); // prevent card click navigation
    const confirmDelete = window.confirm(
      "Delete this course? This cannot be undone."
    );
    if (!confirmDelete) return;
    if (!courseId) {
      console.error("Invalid courseId, cannot delete");
      return;
    }

    // optimistic UI update
    const prev = courses;
    setCourses((c) => c.filter((x) => x.id !== courseId));
    try {
      await coursesApi.delete(courseId);
      // success, nothing else to do
    } catch (err) {
      console.error("Failed to delete course:", err);
      // rollback
      setCourses(prev);
      alert("Failed to delete course. Try again.");
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.description || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "published" && course.isPublished) ||
      (filterStatus === "draft" && !course.isPublished) ||
      (filterStatus === "featured" && course.isFeatured);

    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: courses.length,
    published: courses.filter((c) => c.isPublished).length,
    draft: courses.filter((c) => !c.isPublished).length,
    featured: courses.filter((c) => c.isFeatured).length,
  };

  type StatCard = {
    label: string;
    value: number;
    icon: ComponentType<{ className?: string }>;
    color: keyof typeof colorMap;
  };

  const statCards: StatCard[] = [
    { label: "Total Courses", value: stats.total, icon: BookOpen, color: "blue" },
    { label: "Published", value: stats.published, icon: Eye, color: "green" },
    { label: "Drafts", value: stats.draft, icon: Edit3, color: "amber" },
    { label: "Featured", value: stats.featured, icon: Star, color: "purple" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-[#fff6f6] to-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C21817]" />
              <p className="text-gray-600 font-medium">Loading courses...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-2">Courses</h1>
            <p className="text-gray-600">
              Manage and organize your educational content
            </p>
          </div>
  
          <button
            onClick={handleAddNewCourse}
            className="group flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#C21817] to-[#A51515] text-white shadow-lg shadow-[#C21817]/20 hover:shadow-[#C21817]/30 hover:translate-y-[-1px] active:translate-y-[0px] transition-all"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
            Create New Course
          </button>
        </div>
  
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            const cm = colorMap[stat.color] || colorMap.blue;
            return (
              <div
                key={stat.label}
                className="relative overflow-hidden bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:scale-[1.01] transition-all duration-300"
              >
                <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-gradient-to-br from-[#C21817]/5 to-[#A51515]/5" />
                <div className="flex items-center justify-between relative">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-3xl font-extrabold text-gray-900 mt-1">
                      {stat.value}
                    </p>
                  </div>
                        <div className={`p-3 rounded-xl ${cm.bg}`}>
                          <Icon className={`${cm.text} w-6 h-6`} />
                        </div>
                </div>
              </div>
            );
          })}
        </div>
  
        {/* Filters and Search */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
              />
            </div>
  
            {/* Filter */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="featured">Featured</option>
                </select>
              </div>
  
              {/* View Toggle */}
              <div className="flex rounded-xl border border-gray-200 bg-gray-50 p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-blue-600" : "text-gray-400"}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-white shadow-sm text-blue-600" : "text-gray-400"}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
  
        {/* Courses Grid/List */}
        {filteredCourses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="text-center py-16">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-[#fff5f5] to-[#fff0f0] rounded-2xl flex items-center justify-center mb-6">
                <BookOpen className="w-12 h-12 text-[#C21817]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Get started by creating your first course"}
              </p>
              {!searchTerm && filterStatus === "all" && (
                <button
                  onClick={handleAddNewCourse}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#C21817] to-[#A51515] text-white rounded-xl hover:shadow-lg transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Create Your First Course
                </button>
              )}
            </div>
          </div>
        ) : (
          <div
            className={viewMode === "grid" ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"}
          >
            {filteredCourses.map((course) =>
              viewMode === "grid" ? (
                <div
                  key={course.id}
                  className="group bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/admin/course-management/${course.id}`)}
                >
                  <div className="h-48 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-blue-500" />
                  </div>
  
                  <div className="p-6">
                    <div className="flex flex-wrap gap-2 mb-3 items-center justify-between">
                      <div className="flex gap-2">
                        {course.isFeatured && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gradient-to-r from-yellow-100 to-red-100 text-yellow-800 rounded-full">
                            <Star className="w-3 h-3" />
                            Featured
                          </span>
                        )}
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                            course.isPublished
                              ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800"
                              : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600"
                          }`}
                        >
                          {course.isPublished ? <Eye className="w-3 h-3" /> : <Edit3 className="w-3 h-3" />}
                          {course.isPublished ? "Published" : "Draft"}
                        </span>
                      </div>
  
                      <button
                        onClick={(e) => handleDelete(e, course.id)}
                        className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition"
                        title="Delete course"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
  
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {course.title}
                    </h3>
  
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {course.shortDescription || course.description}
                    </p>
  
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-3">
                        {course.category && (
                          <span className="flex items-center gap-1 capitalize">
                            <BookOpen className="w-3 h-3" />
                            {course.category}
                          </span>
                        )}
                        {course.difficulty && <span className="capitalize">{course.difficulty}</span>}
                      </div>
                    </div>
  
                    {(course.price || course.discountPrice) && (
                      <div className="pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            {course.discountPrice && (
                              <span className="text-lg font-bold text-green-600">
                                ${course.discountPrice}
                              </span>
                            )}
                          </div>
  
                          {course.price && (
                            <div className={`text-sm ${course.discountPrice ? "line-through text-gray-400" : "text-lg font-bold text-gray-900"}`}>
                              ${course.price}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200 p-6 cursor-pointer"
                  onClick={() => navigate(`/admin/course-management/${course.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-8 h-8 text-blue-500" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {course.title}
                          </h3>
                          {course.isFeatured && (
                            <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                          )}
                        </div>

                        <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                          {course.shortDescription || course.description}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span
                            className={`px-2 py-1 rounded-full ${
                              course.isPublished
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {course.isPublished ? "Published" : "Draft"}
                          </span>
                          {course.category && (
                            <span className="capitalize">
                              {course.category}
                            </span>
                          )}
                          {course.difficulty && (
                            <span className="capitalize">
                              {course.difficulty}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {(course.price || course.discountPrice) && (
                        <div className="text-right">
                          {course.discountPrice && (
                            <div className="text-lg font-bold text-green-600">
                              ${course.discountPrice}
                            </div>
                          )}
                          {course.price && (
                            <div
                              className={`text-sm ${
                                course.discountPrice
                                  ? "line-through text-gray-400"
                                  : "text-lg font-bold text-gray-900"
                              }`}
                            >
                              ${course.price}
                            </div>
                          )}
                        </div>
                      )}
                      <button
                        onClick={(e) => handleDelete(e, course.id)}
                        title="Delete course"
                        className="p-2 border rounded border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <Trash />
                      </button>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;
