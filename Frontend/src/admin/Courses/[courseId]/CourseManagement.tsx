import {
  BookOpenText,
  // BarChart3,
  Image,
  List,
  // Rocket,
} from "lucide-react";
import { useState, useEffect } from "react";

import CourseDetailsTab from "../CourseDetailsTab";
import CourseCurriculumTab from "../CurriculumTab";
import { useParams } from "react-router";
import type { CourseData } from "../../../types/course";
import { coursesApi } from "../../../services/GlobalApi";
import { CourseProvider } from "../../../context/CourseContext";
import ThumbnailTab from "../ThumbnailTab";

const CourseManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState("details");
  const [courseInfo, setCourseInfo] = useState<CourseData | null>(null);
  const { courseId } = useParams<{ courseId: string }>();
  const [error, setError] = useState<string>("");
  // Fetch course by ID on mount
  useEffect(() => {
    async function fetchCourse() {
      if (!courseId) return setError("No course ID found.");
      try {
        const docData = await coursesApi.getById(courseId);
        setCourseInfo(docData);
      } catch (error) {
        console.log(error);
        setError("Failed To Load");
      }
    }
    fetchCourse();
  }, [courseId, setCourseInfo]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "details":
        return <CourseDetailsTab />;
      case "curriculum":
        return <CourseCurriculumTab />;
      case "Thumbnail":
        return <ThumbnailTab course={courseInfo} />;
      default:
        return null;
    }
  };

  if (!courseInfo) return <div className="p-10">Loading course...</div>;

  return (
    <CourseProvider>
      {error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <main className="flex flex-col px-4 sm:px-6 lg:px-8 p-10 justify-center">
          <h1 className="font-bold text-4xl font-serif text-start">
            Course Management: {courseInfo.title}
          </h1>
          <p className="text-gray-600 mt-2">{courseInfo.description}</p>

          {/* Tabs */}
          <section className="mt-10">
            <ul className="flex flex-wrap min-h-[60px] w-full border rounded-lg overflow-hidden">
              <li
                className={`flex flex-row items-center justify-center p-4 gap-2 cursor-pointer ${
                  activeTab === "details"
                    ? "bg-blue-50 border-b-2 border-blue-500"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => setActiveTab("details")}
              >
                <BookOpenText className="w-5 h-5" />
                <p className="font-medium">Course Details</p>
              </li>
              <li
                className={`flex flex-row items-center justify-center p-4 gap-2 cursor-pointer ${
                  activeTab === "curriculum"
                    ? "bg-blue-50 border-b-2 border-blue-500"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => setActiveTab("curriculum")}
              >
                <List className="w-5 h-5" />
                <p>Curriculum</p>
              </li>
              <li
                className={`flex flex-row items-center justify-center p-4 gap-2 cursor-pointer ${
                  activeTab === "Thumbnail"
                    ? "bg-blue-50 border-b-2 border-blue-500"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => setActiveTab("Thumbnail")}
              >
                <Image className="w-5 h-5" />
                <p>Thumbnail</p>
              </li>
            </ul>
          </section>

          {/* Tab content */}
          <div className="bg-card border border-border rounded-lg mt-10">
            <div className="p-6">{renderTabContent()}</div>
          </div>
        </main>
      )}
    </CourseProvider>
  );
};

export default CourseManagement;
