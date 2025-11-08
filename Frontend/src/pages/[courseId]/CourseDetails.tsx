import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { LoaderCircleIcon } from "lucide-react";

import type { CourseData } from "../../types/course";
import CourseTabs from "../../components/common/CourseTabs";
import CourseOverview from "../../components/common/CourseOverview";
import CourseCurriculum from "../../components/common/CourseCurriculum";
import CourseInstructor from "../../components/common/CourseInstructor";
import CourseSidebar from "../../components/common/CourseSidebar";
import CourseHero from "../../components/common/CourseHero";
import FaqList from "../../components/FaqList";
import { useAuthContext } from "../../context/AuthProvider";
import ReviewsList from "../../components/ReviewList";
import { useCourse } from "../../hooks/queries/courses";
import RelatedCourses from "../RelatedCourse";

const CourseDetailsPage: React.FC = () => {
  const { courseId } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const { user } = useAuthContext();

  const { data: course, isLoading, isError } = useCourse(courseId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoaderCircleIcon className="animate-spin w-10 h-10 text-purple-600" />
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div className="text-center py-20 text-gray-600">Course not found</div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 font-Quick">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CourseHero course={course as CourseData} />

          <div className="mt-8">
            <CourseTabs activeTab={activeTab} onTabChange={setActiveTab} />

            <div className="mt-6">
              {activeTab === "overview" && <CourseOverview course={course} />}
              {activeTab === "curriculum" && (
                <CourseCurriculum sections={course.sections} />
              )}
              {activeTab === "instructor" && (
                <CourseInstructor instructor={course.instructor} />
              )}
              {activeTab === "reviews" && (
                <ReviewsList
                  courseId={courseId ?? ""}
                  currentUser={
                    user
                      ? {
                          id: user.sub,
                          name: user.name ?? undefined,
                        }
                      : undefined
                  }
                />
              )}
              {activeTab === "faq" && (
                <FaqList
                  courseId={courseId ?? ""}
                  currentUser={user ?? undefined}
                />
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <CourseSidebar course={course} className="lg:sticky lg:top-20" />
        </div>
      </div>
      <div className="mt-12">
        <RelatedCourses />
      </div>
    </div>
  );
};

export default CourseDetailsPage;
