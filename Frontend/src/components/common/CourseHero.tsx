// src/components/CourseHero.tsx
import React, { useMemo } from "react";
import { Star, Users, Clock, BookOpen } from "lucide-react";
import type { CourseData } from "../../types/course";
import getThumbnailUrl from "../../utils/getThumbnailUrl";

type Props = {
  course: CourseData;
  className?: string;
};

const CourseHero: React.FC<Props> = ({ course, className = "" }) => {
  const thumbUrl = useMemo(() => getThumbnailUrl(course), [course]);

  return (
    <div className={className}>
      <div className="relative rounded-xl overflow-hidden shadow-2xl">
        <img
          src={thumbUrl}
          alt={course.title}
          className="w-full h-[420px] object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        <div className="absolute bottom-6 left-6 text-white space-y-2">
          <span className="px-4 py-1 bg-blue-600 rounded-full text-xs font-medium tracking-wide shadow-md">
            {course.difficulty}
          </span>
          <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight drop-shadow-md">
            {course.title}
          </h1>
          <p className="text-lg text-gray-200 max-w-2xl drop-shadow">
            {course.shortDescription}
          </p>
        </div>
      </div>

      {/* stats row (Udemy-style) */}
      <div className="flex flex-wrap items-center gap-6 mt-6 text-gray-700">
        <div className="flex items-center gap-2 text-lg">
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          <span className="font-semibold">{course.rating?.toFixed(1)}</span>
          <span className="text-gray-500 text-sm">
            ({course.reviewCount?.toLocaleString() ?? "0"} reviews)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          <span>{course.studentCount?.toLocaleString() ?? "0"} students</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-600" />
          <span>{course.duration}</span>
        </div>
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-green-600" />
          <span>{course.chapterCount} lessons</span>
        </div>
      </div>
    </div>
  );
};

export default CourseHero;
