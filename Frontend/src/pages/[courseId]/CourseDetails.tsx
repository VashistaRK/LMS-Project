import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  LoaderCircleIcon,
} from "lucide-react";
import { useMemo } from "react";
import { Star, BookOpen } from "lucide-react";
import getThumbnailUrl from "../../utils/getThumbnailUrl";
import { IoPricetagsSharp } from "react-icons/io5";

import CourseCurriculum from "../../components/common/CourseCurriculum";
import FaqList from "../../components/FaqList";
import { useAuthContext } from "../../context/AuthProvider";
import ReviewsList from "../../components/ReviewList";
import { useCourse } from "../../hooks/queries/courses";
import { DarkGradientBg } from "@/components/ui/elegant-dark-pattern";
import RelatedCourses from "../RelatedCourse";

const CourseDetailsPage: React.FC = () => {
  const { courseId } = useParams();
  const { user } = useAuthContext();

  const { data: course, isLoading, isError } = useCourse(courseId);
  const thumbUrl = useMemo(
    () => (course ? getThumbnailUrl(course) : ""),
    [course],
  );

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth", // optional: remove if you want instant scroll
    });
  }, [courseId]);

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
    <DarkGradientBg className="text-[#e5e1e4]">
    <div className="relative z-10 max-w-7xl mx-6 xl:mx-auto py-8 font-mulish">
      <div className=" gap-8">
        <div className="space-y-2 py-12 mb-12">
          <a
            href="/courses"
            className="w-fit flex items-center underline justify-center text-zinc-700 rounded-md font-semibold mb-12 px-2"
          >
            <ArrowLeft className="h-3 pr-1" />
            Back to Courses.
          </a>
          <span className="bg-[#9CCFFF] w-fit flex items-center justify-center text-zinc-700 rounded-md font-semibold px-2 uppercase">
            <IoPricetagsSharp className="h-3 pr-1" />
            {course.difficulty}
          </span>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            {course.title}
          </h1>
          <p className="text-2xl xl:text-4xl text-zinc-500 font-bold max-w-4xl xl:max-w-full tracking-tight leading-tight">
            {course.shortDescription}
          </p>
        </div>
        <div className="relative space-y-12">
          <div className="space-y-4 text-gray-600">
            <div className="flex items-center gap-2 text-lg">
              <Star className="w-5 h-5 " />
              <span className="font-semibold">{course.rating?.toFixed(1)}</span>
              <span className="text-sm">
                ({course.reviewCount?.toLocaleString() ?? "0"})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              <span>
                {course.sections?.reduce(
                  (acc, s) => acc + (s.chapters?.length || 0),
                  0,
                )}{" "}
                lessons
              </span>
            </div>
          </div>
          <img
            src={thumbUrl}
            alt={course.title}
            className="w-1/2 h-[420px] object-cover rounded-xl"
          />
        </div>
        <div className="mt-8">
          {/* Description */}
          <section className="lg:p-4 lg:max-w-3/8 mb-10">
            <h2 className="text-xl font-semibold mb-2">Course Description</h2>
            <p className="text-gray-700 leading-relaxed">
              {course.description}
            </p>
          </section>
          <div className="grid grid-cols-1 lg:grid-cols-2 space-y-16 lg:space-y-0 py-6 xl:my-24 lg:gap-12">
            {/* Learning Outcomes */}
            <section className="lg:p-4">
              <h2 className="text-xl font-semibold mb-2">What you'll learn</h2>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {course.learningOutcomes?.map((outcome, idx) => (
                  <li key={idx}>{outcome}</li>
                ))}
              </ul>
            </section>

            {/* Prerequisites */}
            {course.prerequisites && (
              <section className="lg:p-4">
                <h2 className="text-xl font-semibold mb-2 flex items-center">
                  <AlertTriangle className="text-yellow-300 mr-2" />
                  Prerequisites
                </h2>
                <ul className="list-disc mt-4 list-inside space-y-1 text-gray-700">
                  {(Array.isArray(course.prerequisites)
                    ? course.prerequisites
                    : [course.prerequisites]
                  ).map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </section>
            )}

            {/* Technologies */}
            {course.technologies && course.technologies.length > 0 && (
              <section className="lg:p-4">
                <h2 className="text-xl font-semibold mb-2">
                  Technologies Covered
                </h2>
                <div className="flex flex-wrap gap-2">
                  {course.technologies.map((tech, idx) => (
                    <span key={idx} className="py-1 text-sm font-medium">
                      {tech}
                    </span>
                  ))}
                </div>
              </section>
            )}
            <div className="text-sm space-y-3 mt-4">
              <h3 className="font-semibold text-gray-900">
                This course includes
              </h3>
              <div className="space-y-2 mt-2">
                {Array.isArray(course.features) &&
                  course.features.slice(0, 6).map((f, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{f}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
        <CourseCurriculum sections={course.sections} />

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
        <FaqList courseId={courseId ?? ""} currentUser={user ?? undefined} />
      </div>
      <div className="mt-12">
        <RelatedCourses />
      </div>
    </div>
    </DarkGradientBg>
  );
};

export default CourseDetailsPage;
