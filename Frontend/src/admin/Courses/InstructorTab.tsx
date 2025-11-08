/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useContext, useEffect, type FormEvent } from "react";
import { useParams } from "react-router-dom";
import { LoaderCircleIcon, Plus, X } from "lucide-react";
import { toast } from "sonner";

import type { CourseData, Instructor } from "../../types/course";
import { CourseContext } from "../../context/CourseContext";
import { coursesApi } from "../../services/GlobalApi";

const InstructorTab = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { courseData, setCourseData } = useContext(CourseContext);

  const [formData, setFormData] = useState<CourseData>(
    courseData || ({} as CourseData)
  );
  const [loading, setLoading] = useState(false);

  // 🟢 Load course details when courseId changes
  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;
      try {
        setLoading(true);
        const data = await coursesApi.getById(courseId);
        setFormData(data);
        setCourseData(data);
      } catch (error) {
        console.error("Error fetching course:", error);
        toast.error("Failed to load course details.");
      } finally {
        setLoading(false);
      }
    };

    if (!courseData) {
      fetchCourse();
    }
  }, [courseId, courseData, setCourseData]);

  // 🟢 Keep formData in sync with context
  useEffect(() => {
    if (courseData) setFormData(courseData);
  }, [courseData]);

  // 🟢 Save Course
  const handleSave = async (e: FormEvent) => {
    e.preventDefault();

    if (!courseId) {
      toast.error("Course ID is missing.");
      return;
    }

    setLoading(true);

    try {
      const response = await coursesApi.update(courseId, formData);

      setCourseData((prev: CourseData | null) => ({
        ...(prev || {}),
        ...formData,
      }));

      toast.success("Course saved successfully!");
      console.log("Course saved:", response);
    } catch (error: any) {
      console.error(
        "Error saving course:",
        error.response?.data || error.message
      );
      toast.error("Failed to save course.");
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Education Handlers
  const handleEducationChange = (
    eduIndex: number,
    field: string,
    value: string | number
  ) => {
    const updated = [...formData.instructor];
    if (!updated[0]?.education) updated[0].education = [];
    updated[0].education[eduIndex] = {
      ...updated[0].education[eduIndex],
      [field]: value,
    };
    setFormData({ ...formData, instructor: updated });
  };

  const addEducation = () => {
    const updated = [...formData.instructor];
    if (!updated[0]?.education) updated[0].education = [];
    updated[0].education.push({
      college: "",
      degree: "",
      year: 0,
    });
    setFormData({ ...formData, instructor: updated });
  };

  const removeEducation = (eduIndex: number) => {
    const updated = [...formData.instructor];
    updated[0].education = updated[0].education.filter(
      (_, i) => i !== eduIndex
    );
    setFormData({ ...formData, instructor: updated });
  };

  return (
    <div>
      <form onSubmit={handleSave} className="space-y-10">
        <h3 className="text-xl font-semibold mb-4">Instructor Details</h3>
        {formData.instructor?.map(
          (instructor: Instructor, instIndex: number) => (
            <div
              key={instIndex}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 border p-4 rounded-md"
            >
              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={instructor.name || ""}
                  onChange={(e) => {
                    const updated = [...formData.instructor];
                    updated[instIndex].name = e.target.value;
                    setFormData({ ...formData, instructor: updated });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={instructor.title || ""}
                  onChange={(e) => {
                    const updated = [...formData.instructor];
                    updated[instIndex].title = e.target.value;
                    setFormData({ ...formData, instructor: updated });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              {/* Image Upload */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Profile Image
                </label>
                {instructor.image && (
                  <img
                    src={instructor.image}
                    alt="Instructor"
                    className="h-24 w-24 rounded-full object-cover mb-2 border"
                  />
                )}
                <input
                  type="text"
                  placeholder="Image URL"
                  value={instructor.image || ""}
                  onChange={(e) => {
                    const updated = [...formData.instructor];
                    updated[instIndex].image = e.target.value;
                    setFormData({ ...formData, instructor: updated });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              {/* Bio */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium mb-2">Bio</label>
                <textarea
                  rows={4}
                  value={instructor.bio || ""}
                  onChange={(e) => {
                    const updated = [...formData.instructor];
                    updated[instIndex].bio = e.target.value;
                    setFormData({ ...formData, instructor: updated });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium mb-2">Rating</label>
                <input
                  type="number"
                  step="0.1"
                  value={instructor.rating || ""}
                  onChange={(e) => {
                    const updated = [...formData.instructor];
                    updated[instIndex].rating = parseFloat(e.target.value);
                    setFormData({ ...formData, instructor: updated });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              {/* Reviews */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Reviews
                </label>
                <input
                  type="number"
                  value={instructor.reviews || ""}
                  onChange={(e) => {
                    const updated = [...formData.instructor];
                    updated[instIndex].reviews = parseInt(e.target.value);
                    setFormData({ ...formData, instructor: updated });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              {/* Students */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Students
                </label>
                <input
                  type="number"
                  value={instructor.students || ""}
                  onChange={(e) => {
                    const updated = [...formData.instructor];
                    updated[instIndex].students = parseInt(e.target.value);
                    setFormData({ ...formData, instructor: updated });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              {/* Courses */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Courses
                </label>
                <input
                  type="number"
                  value={instructor.courses || ""}
                  onChange={(e) => {
                    const updated = [...formData.instructor];
                    updated[instIndex].courses = parseInt(e.target.value);
                    setFormData({ ...formData, instructor: updated });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              {/* Expertise */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Expertise
                </label>
                <input
                  type="text"
                  placeholder="Comma separated (e.g. Python, AI, Cloud)"
                  value={instructor.expertise?.join(", ") || ""}
                  onChange={(e) => {
                    const updated = [...formData.instructor];
                    updated[instIndex].expertise = e.target.value
                      .split(",")
                      .map((s) => s.trim());
                    setFormData({ ...formData, instructor: updated });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              {/* Achievements */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Achievements
                </label>
                <input
                  type="text"
                  placeholder="Comma separated (e.g. Published 10 papers, Award winner)"
                  value={instructor.achivements?.join(", ") || ""}
                  onChange={(e) => {
                    const updated = [...formData.instructor];
                    updated[instIndex].achivements = e.target.value
                      .split(",")
                      .map((s) => s.trim());
                    setFormData({ ...formData, instructor: updated });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              {/* Education */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Education
                </label>

                {instructor.education?.map((edu, eduIndex) => (
                  <div
                    key={eduIndex}
                    className="p-4 mb-4 border rounded-lg bg-gray-50 relative"
                  >
                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removeEducation(eduIndex)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>

                    {/* College */}
                    <input
                      type="text"
                      placeholder="College / University"
                      value={edu.college}
                      onChange={(e) =>
                        handleEducationChange(
                          eduIndex,
                          "college",
                          e.target.value
                        )
                      }
                      className="w-11/12 mb-2 px-3 py-2 border rounded-md"
                    />

                    {/* Degree */}
                    <input
                      type="text"
                      placeholder="Degree (e.g., B.Sc, M.Sc, PhD)"
                      value={edu.degree}
                      onChange={(e) =>
                        handleEducationChange(
                          eduIndex,
                          "degree",
                          e.target.value
                        )
                      }
                      className="w-11/12 mb-2 px-3 py-2 border rounded-md"
                    />

                    {/* Years */}
                    <input
                      type="number"
                      placeholder="Year"
                      value={edu.year || ""}
                      onChange={(e) =>
                        handleEducationChange(
                          eduIndex,
                          "year",
                          Number(e.target.value)
                        )
                      }
                      className="flex-1 px-3 py-2 border rounded-md"
                    />
                  </div>
                ))}

                {/* Add Button */}
                <button
                  type="button"
                  onClick={addEducation}
                  className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <Plus size={16} /> Add Education
                </button>
              </div>
            </div>
          )
        )}
        {/* Submit */}
        <div className="flex justify-end gap-4 pt-6">
          <button
            type="button"
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {loading ? (
              <LoaderCircleIcon className="animate-spin" />
            ) : (
              "Save Course"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InstructorTab;
