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

/* -----------------------------------------
   🔹 URL HELPERS
----------------------------------------- */

type PreviewUrls = {
  playable: string;
  preview: string;
};

/* Extract Google Drive File ID */
const extractDriveId = (url?: string): string | null => {
  if (!url) return null;
  const patterns = [
    /\/d\/([a-zA-Z0-9_-]+)\//,
    /[?&]id=([a-zA-Z0-9_-]+)/,
    /\/file\/d\/([a-zA-Z0-9_-]+)$/ 
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m && m[1]) return m[1];
  }
  return null;
};

/* Extract YouTube Video ID */
const extractYoutubeId = (url?: string): string | null => {
  if (!url) return null;

  const patterns = [
    /youtube\.com\/.*v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/embed\/([^?]+)/,
  ];

  for (const re of patterns) {
    const m = url.match(re);
    if (m && m[1]) {
      return m[1];
    }
  }
  return null;
};

/* Convert ANY video URL to preview/play URL */
const resolveVideoUrl = (url?: string): PreviewUrls => {
  if (!url) return { playable: "", preview: "" };

  // 1️⃣ YouTube
  const ytId = extractYoutubeId(url);
  if (ytId) {
    return {
      playable: `https://www.youtube.com/embed/${ytId}`,
      preview: `https://www.youtube.com/embed/${ytId}`,
    };
  }

  // 2️⃣ Google Drive
  const driveId = extractDriveId(url);
  if (driveId) {
    return {
      playable: `https://drive.google.com/uc?export=download&id=${driveId}`,
      preview: `https://drive.google.com/file/d/${driveId}/preview`,
    };
  }

  // 3️⃣ Direct video links (mp4, etc.)
  return { playable: url, preview: url };
};

/* -----------------------------------------
   🔹 COMPONENT
----------------------------------------- */

const CourseCurriculum: React.FC<{ sections: Sections[] }> = ({
  sections,
}) => {
  const [openSection, setOpenSection] = useState<number | null>(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handlePreview = (videoURL: string) => {
    const { preview } = resolveVideoUrl(videoURL);
    setPreviewUrl(preview);
    document.body.style.overflow = "hidden";
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
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
      <div className="space-y-4">
        {sections.map((section, sectionIdx) => (
          <div
            key={sectionIdx}
            className="border rounded shadow-sm hover:shadow-md transition-all"
          >
            <button
              onClick={() =>
                setOpenSection(openSection === sectionIdx ? null : sectionIdx)
              }
              className="w-full flex justify-between items-center px-6 py-5 bg-gray-50 hover:bg-gray-100 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 border border-red-500 text-red-600 rounded flex items-center justify-center font-semibold">
                  {sectionIdx + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {section.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {section.chapters.length} lessons • {section.duration}
                  </p>
                </div>
              </div>

              {openSection === sectionIdx ? (
                <ChevronDown />
              ) : (
                <ChevronRight />
              )}
            </button>

            {/* Chapters */}
            {openSection === sectionIdx && (
              <div>
                {section.chapters.map((chapter, chapterIdx) => (
                  <div
                    key={chapterIdx}
                    className="flex justify-between items-center px-6 py-4 bg-white border-t hover:bg-red-50"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-6 h-6 flex items-center justify-center">
                        {chapter.isPreviewable ? (
                          <PlayCircle className="text-green-600" />
                        ) : (
                          <Lock className="text-gray-400" />
                        )}
                      </div>

                      <div className="flex-1">
                        <h4 className="font-medium">{chapter.title}</h4>
                        {chapter.duration && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <Clock className="w-3 h-3" />
                            {chapter.duration}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Preview Button */}
                    {chapter.isPreviewable && chapter.video && (
                      <button
                        className="px-3 py-1 bg-green-600 text-white rounded-full text-sm hover:bg-green-700"
                        onClick={() => handlePreview(chapter.video)}
                      >
                        Preview
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
          <div className="relative w-11/12 max-w-3xl aspect-video bg-black rounded-lg overflow-hidden">
            <iframe
              src={previewUrl}
              className="w-full h-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />

            <button
              onClick={() => {
                setPreviewUrl(null);
                document.body.style.overflow = "auto";
              }}
              className="absolute top-3 right-3 text-white text-xl"
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
