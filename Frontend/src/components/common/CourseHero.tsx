// src/components/CourseHero.tsx
import React, { useMemo } from "react";
import { Star, BookOpen } from "lucide-react";
import type { CourseData } from "../../types/course";
import getThumbnailUrl from "../../utils/getThumbnailUrl";
import { IoPricetagsSharp } from "react-icons/io5";

type Props = {
  course: CourseData;
};

const CourseHero: React.FC<Props> = ({ course }) => {
  const thumbUrl = useMemo(() => getThumbnailUrl(course), [course]);

  return (
    <div className="w-full">
      <div className="space-y-2 py-12 mb-12">
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
      <div className="relative overflow-hidden justify-between flex">
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
    </div>
  );
};

export default CourseHero;
