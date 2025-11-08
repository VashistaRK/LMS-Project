/* eslint-disable */
import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { BookOpen, Plus, X, Loader2, ChevronDown, ChevronUp, Video, FileQuestion, Code } from "lucide-react";
import { coursesApi } from "../../services/GlobalApi";
import { toast } from "sonner";
import { CourseContext } from "../../context/CourseContext";
import type { CourseData, Chapters, Sections } from "../../types/course";
import NotesForm from "./NotesForm";
import type { Note } from "../../services/notesApi";
import MyEditor from "./Doceditor";
import UploadForm from "./QuizUploadTab";

const CourseCurriculumTab: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { courseData, setCourseData } = useContext(CourseContext);

  const [formData, setFormData] = useState<CourseData>(
    courseData || ({} as CourseData)
  );
  const [loading, setLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());

  // Generate unique docId for a chapter
  const generateDocId = (sectionIndex: number, chapterIndex: number): string => {
    return `${courseId}_section${sectionIndex}_chapter${chapterIndex}_${Date.now()}`;
  };

  // 🟢 Load curriculum
  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;
      try {
        setLoading(true);
        const data = await coursesApi.getById(courseId);
        setFormData(data);
        setCourseData(data);
      } catch (error) {
        console.error("Error fetching curriculum:", error);
        toast.error("Failed to load curriculum.");
      } finally {
        setLoading(false);
      }
    };

    if (!courseData) fetchCourse();
  }, [courseId]);

  // 🟢 Sync context → local state
  useEffect(() => {
    if (courseData) setFormData(courseData);
  }, [courseData]);

  const toggleSection = (index: number) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const toggleChapter = (sectionIndex: number, chapterIndex: number) => {
    const key = `${sectionIndex}-${chapterIndex}`;
    setExpandedChapters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  // ---------------------------
  // Section Handlers
  const addSection = () => {
    const updated: CourseData = {
      ...formData,
      sections: [
        ...(formData.sections || []),
        { title: "", lectureCount: 0, duration: "", chapters: [] },
      ],
    };
    setFormData(updated);
    setCourseData(updated);
  };

  const removeSection = (sectionIndex: number) => {
    const updated: CourseData = {
      ...formData,
      sections: (formData.sections || []).filter((_, i) => i !== sectionIndex),
    };
    setFormData(updated);
    setCourseData(updated);
  };

  const handleSectionChange = (
    sectionIndex: number,
    field: keyof Sections,
    value: string | number
  ) => {
    const updatedSections = [...(formData.sections || [])];
    (updatedSections[sectionIndex][field] as any) = value;

    const updated: CourseData = { ...formData, sections: updatedSections };
    setFormData(updated);
    setCourseData(updated);
  };

  // ---------------------------
  // Chapter Handlers
  const addChapter = (sectionIndex: number) => {
    const updatedSections = [...(formData.sections || [])];
    const chapterIndex = updatedSections[sectionIndex].chapters.length;
    const newDocId = generateDocId(sectionIndex, chapterIndex);

    updatedSections[sectionIndex].chapters.push({
      title: "",
      description: "",
      duration: "",
      type: "video",
      isPreviewable: false,
      tags: [],
      video: "",
      quizId: "",
      notes: [
        {
          heading: "",
          content: "",
        },
      ],
      notesId: newDocId,
    });

    const updated: CourseData = { ...formData, sections: updatedSections };
    setFormData(updated);
    setCourseData(updated);
  };

  const removeChapter = (sectionIndex: number, chapterIndex: number) => {
    const updatedSections = [...(formData.sections || [])];
    updatedSections[sectionIndex].chapters = updatedSections[
      sectionIndex
    ].chapters.filter((_, i) => i !== chapterIndex);

    const updated: CourseData = { ...formData, sections: updatedSections };
    setFormData(updated);
    setCourseData(updated);
  };

  const handleChapterChange = (
    sectionIndex: number,
    chapterIndex: number,
    field: keyof Chapters,
    value: string | boolean | string[] | Note[]
  ) => {
    const updatedSections = [...(formData.sections || [])];
    (updatedSections[sectionIndex].chapters[chapterIndex][field] as any) =
      value;

    const updated: CourseData = { ...formData, sections: updatedSections };
    setFormData(updated);
    setCourseData(updated);
  };

  // Ensure chapter has notesId only when needed
  const ensureNotesId = (sectionIndex: number, chapterIndex: number, forceCreate = false): string | undefined => {
    const chapter = formData.sections?.[sectionIndex]?.chapters?.[chapterIndex];

    // Return if already exists
    if (chapter?.notesId) {
      return chapter.notesId;
    }

    // Only generate if explicitly asked
    if (forceCreate) {
      const newDocId = generateDocId(sectionIndex, chapterIndex);
      handleChapterChange(sectionIndex, chapterIndex, "notesId", newDocId);
      return newDocId;
    }

    return undefined;
  };


  // ---------------------------
  // Save Handler
  const handleSave = async () => {
    if (!courseId) {
      toast.error("Course ID is missing.");
      return;
    }

    setLoading(true);

    try {
      const response = await coursesApi.update(courseId, {
        sections: formData.sections || [],
      });

      setCourseData((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          sections: formData.sections || [],
        };
      });

      toast.success("Curriculum saved successfully!");
      console.log("Saved curriculum:", response);
    } catch (error: any) {
      console.error("Error saving curriculum:", error);
      toast.error("Failed to save curriculum.");
    } finally {
      setLoading(false);
    }
  };

  const getChapterIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="w-4 h-4 text-[#C21817]" />;
      case "quiz":
        return <FileQuestion className="w-4 h-4 text-[#C21817]" />;
      case "assignment":
        return <Code className="w-4 h-4 text-green-600" />;
      default:
        return <Video className="w-4 h-4" />;
    }
  };

  return (
    <section className="mt-8 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#fff5f5] to-white p-6 rounded-xl mb-6 border border-[#FFEAEA] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-[#C21817] to-[#A51515] rounded-lg">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
                            className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm"
            <p className="text-sm text-gray-600 mt-1">
              Build your course structure with sections and chapters
            </p>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {(formData.sections || []).map(
          (section: Sections, sectionIndex: number) => {
            const isExpanded = expandedSections.has(sectionIndex);
            return (
              <div
                key={sectionIndex}
                className="border-2 border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Section Header */}
                <div className="bg-gradient-to-r from-red-50 to-amber-50 p-4 border-b-2 border-red-200">
                  <div className="flex justify-between items-center">
                    <div onClick={() => toggleSection(sectionIndex)} className="flex items-center gap-3 flex-1">
                      <button
                        type="button"
                        className="p-1 hover:bg-red-200 rounded transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-700" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-700" />
                        )}
                      </button>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 text-red-500 text-sm font-bold rounded-full">
                          {sectionIndex + 1} {")"}
                        </span>
                        <h3 className="font-bold text-lg text-gray-800">
                          {section.title || `Section ${sectionIndex + 1}`}
                        </h3>
                      </div>
                      <div className="flex items-center gap-4 ml-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Video className="w-4 h-4" />
                          {section.lectureCount || 0} lectures
                        </span>
                        {section.duration && (
                          <span>⏱️ {section.duration}</span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSection(sectionIndex)}
                      className="p-2 text-red-500 border-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove Section"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Section Content */}
                {isExpanded && (
                  <div className="p-6 space-y-6 bg-gradient-to-br from-red-50/30 to-amber-50/30">
                    {/* Section Title */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Section Title *
                      </label>
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) =>
                          handleSectionChange(sectionIndex, "title", e.target.value)
                        }
                        placeholder="Enter section title"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                      />
                    </div>

                    {/* Lecture Count + Duration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Lecture Count *
                        </label>
                        <input
                          type="number"
                          value={section.lectureCount}
                          onChange={(e) =>
                            handleSectionChange(
                              sectionIndex,
                              "lectureCount",
                              +e.target.value
                            )
                          }
                          placeholder="0"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Duration
                        </label>
                        <input
                          type="text"
                          value={section.duration}
                          onChange={(e) =>
                            handleSectionChange(
                              sectionIndex,
                              "duration",
                              e.target.value
                            )
                          }
                          placeholder="e.g., 2h 30m"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                        />
                      </div>
                    </div>

                    {/* Chapters */}
                    <div className="space-y-3">
                      <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <span className="w-1 h-6 bg-[#C21817] rounded"></span>
                        Chapters
                      </h4>

                      {(section.chapters || []).map((chapter, chapterIndex) => {
                        const chapterKey = `${sectionIndex}-${chapterIndex}`;
                        const isChapterExpanded = expandedChapters.has(chapterKey);

                        return (
                          <div
                            key={chapterIndex}
                            className="border-2 border-blue-200 rounded-lg overflow-hidden bg-white shadow-sm"
                          >
                            {/* Chapter Header */}
                            <div className="bg-gradient-to-r from-[#fff5f5] to-white p-3 border-b border-[#FFEAEA]">
                              <div className="flex justify-between items-center">
                                <div onClick={() => toggleChapter(sectionIndex, chapterIndex)} className="flex items-center gap-3 flex-1">
                                  <button
                                    type="button"
                                    
                                    className="p-1 hover:bg-red-100 rounded transition-colors"
                                  >
                                    {isChapterExpanded ? (
                                      <ChevronUp className="w-4 h-4 text-gray-700" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4 text-gray-700" />
                                    )}
                                  </button>
                                  {getChapterIcon(chapter.type)}
                                  <span className="font-semibold text-gray-800">
                                    Chapter {chapterIndex + 1}: {chapter.title || "Untitled"}
                                  </span>
                                  {chapter.isPreviewable && (
                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                                      Preview
                                    </span>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeChapter(sectionIndex, chapterIndex)}
                                  className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                                  title="Remove Chapter"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Chapter Content */}
                            {isChapterExpanded && (
                              <div className="p-5 space-y-5 bg-gradient-to-br from-[#fff5f5]/30 to-[#fff0f0]/30">
                                {/* Chapter Title */}
                                <div>
                                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Chapter Title *
                                  </label>
                                    <input
                                      type="text"
                                      value={chapter.title}
                                      onChange={(e) =>
                                        handleChapterChange(
                                          sectionIndex,
                                          chapterIndex,
                                          "title",
                                          e.target.value
                                        )
                                      }
                                      placeholder="Enter chapter title"
                                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C21817] focus:border-[#C21817] transition-all"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {/* Type */}
                                  <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                      Type
                                    </label>
                                    <select
                                      value={chapter.type}
                                      onChange={(e) =>
                                        handleChapterChange(
                                          sectionIndex,
                                          chapterIndex,
                                          "type",
                                          e.target.value
                                        )
                                      }
                                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C21817] focus:border-[#C21817] transition-all"
                                    >
                                      <option value="video">📹 Video</option>
                                      <option value="quiz">❓ Quiz</option>
                                      <option value="assignment">💻 Coding</option>
                                    </select>
                                  </div>

                                  {chapter.type === "video" && (
                                    <>
                                      <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                          Duration
                                        </label>
                                        <input
                                          type="text"
                                          value={chapter.duration}
                                          onChange={(e) =>
                                            handleChapterChange(
                                              sectionIndex,
                                              chapterIndex,
                                              "duration",
                                              e.target.value
                                            )
                                          }
                                          placeholder="e.g., 15m"
                                          className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C21817] focus:border-[#C21817] transition-all"
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                          Tags
                                        </label>
                                        <input
                                          type="text"
                                          value={chapter.tags?.join(", ")}
                                          onChange={(e) =>
                                            handleChapterChange(
                                              sectionIndex,
                                              chapterIndex,
                                              "tags",
                                              e.target.value.split(",").map((tag) => tag.trim())
                                            )
                                          }
                                          placeholder="tag1, tag2, tag3"
                                          className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C21817] focus:border-[#C21817] transition-all"
                                        />
                                      </div>
                                    </>
                                  )}
                                </div>

                                {/* Type-specific fields */}
                                {chapter.type === "video" ? (
                                  <>
                                    <div>
                                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Video URL
                                      </label>
                                      <input
                                        type="text"
                                        value={chapter.video}
                                        onChange={(e) =>
                                          handleChapterChange(
                                            sectionIndex,
                                            chapterIndex,
                                            "video",
                                            e.target.value
                                          )
                                        }
                                        placeholder="https://..."
                                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C21817] focus:border-[#C21817] transition-all"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Description
                                      </label>
                                      <textarea
                                        value={chapter.description}
                                        onChange={(e) =>
                                          handleChapterChange(
                                            sectionIndex,
                                            chapterIndex,
                                            "description",
                                            e.target.value
                                          )
                                        }
                                        placeholder="Enter chapter description"
                                        rows={3}
                                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                                      />
                                    </div>

                                    {/* Doc Editor */}
                                    <div className="border-2 border-[#FFEAEA] rounded-lg p-4 bg-[#fff5f5]/50">
                                      <label className="block text-lg font-bold text-gray-700 mb-3">
                                        Chapter Notes Editor
                                      </label>
                                      {chapter.notesId ? (
                                        <MyEditor docId={chapter.notesId} />
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const newId = ensureNotesId(sectionIndex, chapterIndex, true); // now force create
                                            if (newId) {
                                              // state is already updated via handleChapterChange
                                            }
                                          }}
                                          className="px-4 py-2 bg-gradient-to-r from-[#C21817] to-[#A51515] text-white rounded-lg hover:opacity-95"
                                        >
                                          ➕ Add Notes
                                        </button>
                                      )}
                                    </div>


                                    <NotesForm
                                      initialNotes={chapter.notes}
                                      notesId={chapter.notesId}
                                      onSave={(updatedNotes) =>
                                        handleChapterChange(
                                          sectionIndex,
                                          chapterIndex,
                                          "notes",
                                          updatedNotes
                                        )
                                      }
                                    />
                                  </>
                                ) : chapter.type === "quiz" ? (
                                  <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                      Quiz Upload
                                    </label>
                                    {chapter.quizId ? (
                                      <p className="text-sm text-gray-600">Quiz ID: {chapter.quizId}</p>
                                    ) : (
                                      <UploadForm
                                        courseId={courseId || ''}
                                        sectionId={String(sectionIndex)}
                                        chapterId={String(chapterIndex)}
                                        onUploadSuccess={(quizId) => handleChapterChange(sectionIndex, chapterIndex, "quizId", quizId)}
                                      />
                                    )}
                                  </div>
                                ) : (
                                  <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                      Coding Question ID
                                    </label>
                                    <input
                                      type="text"
                                      value={chapter.quizId}
                                      onChange={(e) =>
                                        handleChapterChange(
                                          sectionIndex,
                                          chapterIndex,
                                          "quizId",
                                          e.target.value
                                        )
                                      }
                                      placeholder="e.g., 1"
                                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    />
                                  </div>
                                )}

                                {/* Previewable */}
                                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                  <input
                                    type="checkbox"
                                    checked={chapter.isPreviewable}
                                    onChange={(e) =>
                                      handleChapterChange(
                                        sectionIndex,
                                        chapterIndex,
                                        "isPreviewable",
                                        e.target.checked
                                      )
                                    }
                                    className="w-4 h-4 text-[#C21817] border-gray-300 rounded focus:ring-[#C21817]"
                                  />
                                  <span className="text-sm font-medium text-gray-700">
                                    Make this chapter previewable (free preview)
                                  </span>
                                </label>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      <button
                        type="button"
                        onClick={() => addChapter(sectionIndex)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-[#FFD6D6] rounded-lg text-[#C21817] font-medium hover:bg-red-50 hover:border-[#FFC2C2] transition-all"
                      >
                        <Plus className="w-5 h-5" /> Add New Chapter
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          }
        )}
      </div>

      {/* Add Section Button */}
      <button
        type="button"
        onClick={addSection}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 mt-6 border-2 border-dashed border-green-400 rounded-xl text-green-600 font-semibold hover:bg-green-50 hover:border-green-500 transition-all"
      >
        <Plus className="w-6 h-6" /> Add New Section
      </button>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mt-8 pt-6 border-t-2 border-gray-200">
        <button
          type="button"
          className="px-8 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin w-5 h-5" />
              Saving...
            </>
          ) : (
            "Save Curriculum"
          )}
        </button>
      </div>
    </section>
  );
};

export default CourseCurriculumTab;