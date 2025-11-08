import React, { useState } from "react";
import type { Sections } from "../../types/course";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Clock,
  Lock,
  PlayCircle,
} from "lucide-react";

interface CourseCurriculumProps {
  sections: Sections[];
}

type PreviewUrls = {
  playable: string;
  preview: string;
};

const extractDriveId = (url?: string): string | null => {
  if (!url) return null;
  const patterns = [
    /\/d\/([a-zA-Z0-9_-]+)\//,
    /[?&]id=([a-zA-Z0-9_-]+)/,
    /\/file\/d\/([a-zA-Z0-9_-]+)$/,
    /\/uc\?export=download&id=([a-zA-Z0-9_-]+)/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m && m[1]) return m[1];
  }
  return null;
};

const toDrivePlayable = (url?: string): PreviewUrls => {
  if (!url) return { playable: "", preview: "" };
  const id = extractDriveId(url);
  if (id) {
    const playable = `https://drive.google.com/uc?export=download&id=${id}`;
    const preview = `https://drive.google.com/file/d/${id}/preview`;
    return { playable, preview };
  }
  return { playable: url, preview: "" };
};

const CourseCurriculum: React.FC<CourseCurriculumProps> = ({ sections }) => {
  const [openSection, setOpenSection] = useState<number | null>(0);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handlePreview = (video: string) => {
    const { preview } = toDrivePlayable(video);
    setPreviewUrl(preview);
    document.body.style.overflow = "hidden";
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="text-red-900 rounded">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Course Curriculum
          </h2>
        </div>
        <span className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          {sections.length} Sections
        </span>
      </div>

      {/* Curriculum Sections */}
      <div className="space-y-4">
        {sections.map((section, sectionIdx) => (
          <div
            key={sectionIdx}
            className="border rounded shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
          >
            {/* Section Header */}
            <button
              onClick={() =>
                setOpenSection(openSection === sectionIdx ? null : sectionIdx)
              }
              className="w-full flex justify-between items-center px-6 py-5  hover:from-red-50 hover:to-purple-50 transition-all duration-300 group"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-8 h-8 text-red-600 border border-red-500 rounded text-sm font-semibold">
                  {sectionIdx + 1}
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 group-hover:text-red-700 transition-colors">
                    {section.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {section.chapters.length} lessons | {section.duration}{" "}
                    Duration
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {openSection === sectionIdx ? (
                  <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" />
                )}
              </div>
            </button>

            {/* Chapters */}
            {openSection === sectionIdx && (
              <div className="">
                {section.chapters.map((chapter, chapterIdx) => (
                  <div
                    key={chapterIdx}
                    className={`flex justify-between items-center px-6 py-4 bg-red-200/50 hover:bg-red-100/80 transition-colors group border-t border-yellow-600 `}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center justify-center w-6 h-6">
                        {chapter.isPreviewable ? (
                          <PlayCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Lock className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 group-hover:text-red-700 transition-colors">
                          {chapter.title}
                        </h4>
                        {chapter.duration && (
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {chapter.duration}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {chapter.isPreviewable && (
                        <button
                          className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-medium rounded-full hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-sm"
                          onClick={() => handlePreview(chapter.video)}
                        >
                          Preview
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Modal overlay */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 bg-opacity-80">
          <div className="relative w-11/12 max-w-3xl aspect-video bg-black/60 rounded-lg overflow-hidden shadow-lg">
            <iframe
              src={previewUrl}
              title="Google Drive Video Preview"
              className="w-full h-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
            {/* Close button */}
            <button
              onClick={() => {
                setPreviewUrl(null);
                document.body.style.overflow = "auto";
              }}
              className="absolute top-3 right-3 text-white text-2xl"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseCurriculum;

{
  /* Progress Indicator */
}
// <div className="mt-8 p-6 bg-gradient-to-r from-red-50 to-purple-50 rounded-2xl border border-red-100">
//   <div className="flex items-center justify-between">
//     <div>
//       <h3 className="font-semibold text-gray-900 mb-1">
//         Course Progress
//       </h3>
//       <p className="text-sm text-gray-600">
//         Complete all lessons to earn your certificate
//       </p>
//     </div>
//     <div className="text-right">
//       <div className="text-2xl font-bold bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent">
//         0%
//       </div>
//       <p className="text-sm text-gray-500">
//         {/* 0 of {totalLessons} completed */}
//       </p>
//     </div>
//   </div>
//   <div className="mt-4">
//     <div className="w-full bg-gray-200 rounded-full h-2">
//       <div className="bg-gradient-to-r from-red-500 to-purple-600 h-2 rounded-full w-0 transition-all duration-500"></div>
//     </div>
//   </div>
// </div>;
