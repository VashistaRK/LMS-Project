import React, { useState } from "react";
import type { Sections } from "../../types/course";
import { BookOpen, ChevronDown, ChevronRight } from "lucide-react";

/* -----------------------------------------
   🔹 URL HELPERS
----------------------------------------- */

export type VideoSource = {
  type: "youtube" | "drive" | "direct" | "other" | "none";
  playable: string;
  preview: string;
};

/* -----------------------------------------
   🔹 COMPONENT
----------------------------------------- */

const CourseCurriculum: React.FC<{ sections: Sections[] }> = ({ sections }) => {
  const [openSection, setOpenSection] = useState<number | null>(0);

  return (
    <div className="max-w-2xl mr-auto p-6 md:16 xl:mb-24">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-6 h-6" />
          <h2 className="text-3xl font-bold text-gray-800">
            Course Curriculum
          </h2>
        </div>
        <span className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          {sections.length} Sections
        </span>
      </div>

      {/* Sections */}
      <div className="space-y-4 lg:space-y-8">
        {sections.map((section, sectionIdx) => (
          <div key={sectionIdx} className="">
            <button
              onClick={() =>
                setOpenSection(openSection === sectionIdx ? null : sectionIdx)
              }
              className="w-full flex justify-between items-center hover:border-l-4 hover:border-gray-500 transition-all"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-8 h-8 border-r-2 flex items-center justify-center font-semibold">
                  {sectionIdx + 1}
                </div>
                <div className="text-start">
                  <h3 className="font-semibold text-gray-900">
                    {section.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {section.chapters.length} lessons • {section.duration}
                  </p>
                </div>
              </div>

              {openSection === sectionIdx ? <ChevronDown /> : <ChevronRight />}
            </button>

            {/* Chapters */}
            {openSection === sectionIdx && (
              <div>
                {section.chapters.map((chapter, chapterIdx) => (
                  <ul
                    key={chapterIdx}
                    className="list-disc pl-5 w-11/12 ml-auto flex justify-between items-center p-2 hover:bg-blue-50"
                  >
                    <li className="font-medium">{chapter.title}</li>
                  </ul>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseCurriculum;
