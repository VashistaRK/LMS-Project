/* eslint-disable */
import React, {
  useState,
  useEffect,
  useContext,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useParams } from "react-router-dom";
import { BookOpenText, LoaderCircleIcon, Plus, X } from "lucide-react";
import { coursesApi } from "../../services/GlobalApi";
import { toast } from "sonner";
import type {
  CourseData,
  CategoryOption,
  DifficultyLevel,
  LanguageOption,
} from "../../types/course";
import { CourseContext } from "../../context/CourseContext";

const CourseDetailsTab: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { courseData, setCourseData } = useContext(CourseContext);

  const [formData, setFormData] = useState<CourseData>(
    courseData || ({} as CourseData)
  );
  const [loading, setLoading] = useState(false);

  const [tagInput, setTagInput] = useState("");
  const [tagInputTech, setTagInputTech] = useState("");
  const [outcomeInput, setOutcomeInput] = useState("");

  // ---------------------------
  // Sync formData with context safely
  // ---------------------------
  useEffect(() => {
    if (courseData && JSON.stringify(courseData) !== JSON.stringify(formData)) {
      setFormData(courseData);
    }
  }, [courseData]);

  // ---------------------------
  // Load course by ID
  // ---------------------------
  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;
      setLoading(true);
      try {
        const data = await coursesApi.getById(courseId);
        setFormData(data);
        setCourseData(data);
      } catch (err) {
        console.error("Error fetching course:", err);
        toast.error("Failed to load course details.");
      } finally {
        setLoading(false);
      }
    };

    if (!courseData) fetchCourse();
  }, [courseId]);

  // ---------------------------
  // Handle input changes
  // ---------------------------
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    const updated = {
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    };
    setFormData(updated);
    setCourseData(updated);
  };

  // ---------------------------
  // Save course
  // ---------------------------
  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!courseId) return toast.error("Course ID is missing.");
    console.log("Data:", formData);

    setLoading(true);
    try {
      const response = await coursesApi.update(courseId, formData);
      setCourseData({ ...(courseData || {}), ...formData });
      toast.success("Course saved successfully!");
      console.log("Course saved:", response);
    } catch (err: any) {
      console.error("Error saving course:", err.response?.data || err.message);
      toast.error("Failed to save course.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // Options
  // ---------------------------
  const categories: CategoryOption[] = [
    { value: "Python", label: "Python Programming" },
    { value: "Java", label: "Java Development" },
    { value: "JavaScript", label: "JavaScript" },
    { value: "C++", label: "C++ Programming" },
    { value: "C", label: "C Programming" },
    { value: "Go", label: "Go Programming" },
    { value: "R", label: "R Programming" },
    { value: "SQL", label: "SQL & Databases" },
    { value: "Oracle", label: "Oracle Database" },
    { value: "AI & ML", label: "AI & Machine Learning" },
    { value: "AI Agents", label: "AI Agents" },
    { value: "DevOps", label: "DevOps" },
    { value: "Tableau", label: "Tableau Analytics" },
  ];

  const difficultyLevels: DifficultyLevel[] = [
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" },
    { value: "expert", label: "Expert" },
  ];

  const languages: LanguageOption[] = [
    { value: "english", label: "English" },
    { value: "spanish", label: "Spanish" },
    { value: "french", label: "French" },
    { value: "german", label: "German" },
  ];

  // ---------------------------
  // Tag Handlers
  // ---------------------------
  const addFeature = () => {
    if (tagInput.trim()) {
      const updated = {
        ...formData,
        features: [...(formData.features || []), tagInput.trim()],
      };
      setFormData(updated);
      setCourseData(updated);
      setTagInput("");
    }
  };

  const removeFeature = (feature: string) => {
    const updated = {
      ...formData,
      features: (formData.features || []).filter((f) => f !== feature),
    };
    setFormData(updated);
    setCourseData(updated);
  };

  // Add Technology
  const addTechnology = () => {
    if (tagInputTech.trim()) {
      const updated = {
        ...formData,
        technologies: [...(formData.technologies || []), tagInputTech.trim()],
      };
      setFormData(updated);
      setCourseData(updated); // if you're syncing courseData
      setTagInputTech(""); // clear input
    }
  };

  // Remove Technology
  const removeTechnology = (tech: string) => {
    const updated = {
      ...formData,
      technologies: (formData.technologies || []).filter((t) => t !== tech),
    };
    setFormData(updated);
    setCourseData(updated); // keep in sync
  };

  const addOutcome = () => {
    if (outcomeInput.trim()) {
      const updated = {
        ...formData,
        learningOutcomes: [
          ...(formData.learningOutcomes || []),
          outcomeInput.trim(),
        ],
      };
      setFormData(updated);
      setCourseData(updated);
      setOutcomeInput("");
    }
  };

  const removeOutcome = (outcome: string) => {
    const updated = {
      ...formData,
      learningOutcomes: (formData.learningOutcomes || []).filter(
        (o) => o !== outcome
      ),
    };
    setFormData(updated);
    setCourseData(updated);
  };

  // ---------------------------
  // UI
  // ---------------------------
  return (
    <section className="mt-8">
      <form onSubmit={handleSave} className="space-y-10">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <BookOpenText className="w-6 h-6" />
          <h2 className="text-2xl font-bold">Course Details</h2>
        </div>
        {/* Basic Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Title */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          {/* Short Description */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Short Description *
            </label>
            <input
              type="text"
              name="shortDescription"
              value={formData.shortDescription || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          {/* Full Description */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description || ""}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              name="category"
              value={formData.category || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty Level
            </label>
            <select
              name="difficulty"
              value={formData.difficulty || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              {difficultyLevels.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price ($)
            </label>
            <input
              type="number"
              name="price"
              value={formData.price || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
          {/* Discount Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discount Price ($)
            </label>
            <input
              type="number"
              name="discountPrice"
              value={formData.discountPrice || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration
            </label>
            <input
              type="text"
              name="duration"
              value={formData.duration || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 8 weeks, 20 hours"
            />
          </div>
          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select
              name="language"
              value={formData.language || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              {languages.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
          {/* ChapterCount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              exerciseCount
            </label>
            <input
              type="number"
              name="exerciseCount"
              value={formData.exerciseCount || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* exerciseCount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chapter Count
            </label>
            <input
              type="number"
              name="chapterCount"
              value={formData.chapterCount || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating
            </label>
            <input
              type="number"
              name="rating"
              value={formData.rating || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              reviewCount
            </label>
            <input
              type="number"
              name="reviewCount"
              value={formData.reviewCount || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              studentCount
            </label>
            <input
              type="number"
              name="studentCount"
              value={formData.studentCount || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        {/* Features */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Features
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Add feature"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={addFeature}
              className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.features?.map((f) => (
              <span
                key={f}
                className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
              >
                {f}
                <button
                  type="button"
                  onClick={() => removeFeature(f)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>
        {/* technologies */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Technologies
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInputTech}
              onChange={(e) => setTagInputTech(e.target.value)}
              placeholder="Add technology"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={addTechnology}
              className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {formData.technologies?.map((tech) => (
              <span
                key={tech}
                className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
              >
                {tech}
                <button
                  type="button"
                  onClick={() => removeTechnology(tech)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Prerequisites */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prerequisites
          </label>
          <textarea
            name="prerequisites"
            value={formData.prerequisites || ""}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {/* Learning Outcomes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Learning Outcomes
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={outcomeInput}
              onChange={(e) => setOutcomeInput(e.target.value)}
              placeholder="Add learning outcome"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={addOutcome}
              className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.learningOutcomes?.map((o) => (
              <span
                key={o}
                className="flex items-center gap-2 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
              >
                {o}
                <button
                  type="button"
                  onClick={() => removeOutcome(o)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { name: "isPublished", label: "Published" },
            { name: "isFeatured", label: "Featured" },
            { name: "allowComments", label: "Allow Comments" },
            { name: "certificateEnabled", label: "Certificate Enabled" },
          ].map((setting) => (
            <label key={setting.name} className="flex items-center gap-2">
              <input
                type="checkbox"
                name={setting.name}
                checked={(formData as any)[setting.name] || false}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">{setting.label}</span>
            </label>
          ))}
        </div>
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
    </section>
  );
};

export default CourseDetailsTab;
