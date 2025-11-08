import React from "react";
import { useParams, Link } from "react-router-dom";
import { Eye, LoaderCircleIcon } from "lucide-react";
import { useRelatedCourses } from "../hooks/queries/courses";
import type { CourseData } from "../types/course";
import getThumbnailUrl from "@/utils/getThumbnailUrl";
import AddToCartButton from "@/components/funui/AddToCartButton";

const RelatedCourses: React.FC = () => {
  const { courseId } = useParams();
  const {
    data: relatedCourses,
    isLoading,
    isError,
  } = useRelatedCourses(courseId || "");

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <LoaderCircleIcon className="animate-spin w-8 h-8 text-purple-600" />
      </div>
    );
  }

  if (isError || !relatedCourses || relatedCourses.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        No related courses found.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Related Courses</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {relatedCourses.map((course: CourseData) => {
          const thumbUrl = getThumbnailUrl(course);
          return (
            course.isPublished && (
              <div
                key={course.id}
                className={`overflow-hidden transition-all group`}
              >
                <Link
                  to={`/course-details/${course.id}`}
                  className="block relative overflow-hidden"
                >
                  <img
                    src={thumbUrl}
                    alt={course.title}
                    className={`object-cover transition-transform duration-300 group-hover:scale-105 w-full h-48 sm:h-52`}
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Eye className="text-white h-11 w-11" />
                  </div>
                </Link>

                <div
                  className={`p-4 sm:p-6 flex flex-col justify-betweenmin-h-[180px]`}
                >
                  <div className="flex-1">
                    <Link to={`/course-details/${course.id}`}>
                      <h2 className="text-base sm:text-lg font-semibold mb-2 line-clamp-2transition-colors">
                        {course.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-500 mb-3">
                        {course.instructor.at(0)?.name || "Instructor"} |{" "}
                        {course.difficulty} | {course.duration}
                      </p>
                    </Link>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lime-700 font-bold text-base sm:text-lg">
                        ₹{course.discountPrice.toFixed(2)}
                      </span>
                      {course.price &&
                        course.discountPrice !== course.price && (
                          <del className="text-red-400 text-sm">
                            ₹{course.price}
                          </del>
                        )}
                    </div>
                    <AddToCartButton course={course} />
                  </div>
                </div>
              </div>
            )
          );
        })}
      </div>
    </div>
  );
};

export default RelatedCourses;
