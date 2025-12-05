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

export type VideoSource = {
  type: "youtube" | "drive" | "direct" | "other" | "none";
  playable: string;
  preview: string;
};

/* Extract Google Drive File ID */
const extractDriveId = (url?: string): string | null => {
  if (!url) return null;
  const patterns = [
    /\/d\/([a-zA-Z0-9_-]+)\//, // /file/d/ID/
    /[?&]id=([a-zA-Z0-9_-]+)/, // ?id=ID or &id=ID
    /\/file\/d\/([a-zA-Z0-9_-]+)$/, // /file/d/ID
    /\/uc\?export=download&id=([a-zA-Z0-9_-]+)/, // /uc?export=download&id=ID
  ];
  for (const re of patterns) {
    const match = url.match(re);
    if (match?.[1]) return match[1];
  }
  return null;
};

/* Convert ANY video URL to preview/play URL */
const resolveVideoSource = (url?: string): VideoSource => {
  if (!url) return { type: "none", playable: "", preview: "" };

  // 1. YouTube (watch?v=, youtu.be/, embed/)
  const ytRegex =
    /(?:youtube\.com\/.*v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
  const ytMatch = url.match(ytRegex);
  if (ytMatch) {
    const id = ytMatch[1];
    return {
      type: "youtube",
      playable: `https://www.youtube.com/embed/${id}`,
      preview: "",
    };
  }

  // 2. Google Drive
  const driveId = extractDriveId(url);
  if (driveId) {
    return {
      type: "drive",
      playable: `https://drive.google.com/uc?export=download&id=${driveId}`,
      preview: `https://drive.google.com/file/d/${driveId}/preview`,
    };
  }

  // 3. Direct video extension (.mp4, .webm, .mov, etc.)
  const exts = [".mp4", ".mov", ".webm", ".ogg", ".m4v"];
  const lower = url.toLowerCase();
  if (exts.some((ext) => lower.endsWith(ext))) {
    return { type: "direct", playable: url, preview: "" };
  }

  return { type: "other", playable: url, preview: "" };
};

/* -----------------------------------------
   🔹 COMPONENT
----------------------------------------- */

const CourseCurriculum: React.FC<{ sections: Sections[] }> = ({
  sections,
}) => {
  const [openSection, setOpenSection] = useState<number | null>(0);
  const [previewVideo, setPreviewVideo] = useState<VideoSource | null>(null);
  const [videoError, setVideoError] = useState(false);

  const handlePreview = (videoURL: string) => {
    const videoSource = resolveVideoSource(videoURL);
    setPreviewVideo(videoSource);
    setVideoError(false);
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
      {previewVideo && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden">
            {previewVideo.type === "direct" && !videoError ? (
              <video
                key={previewVideo.playable}
                src={previewVideo.playable}
                controls
                controlsList="nodownload"
                className="w-full h-full object-contain"
                onError={() => setVideoError(true)}
              />
            ) : previewVideo.type === "youtube" || previewVideo.type === "drive" ? (
              <iframe
                title="Video preview"
                src={previewVideo.type === "youtube" ? previewVideo.playable : previewVideo.preview}
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
                className="w-full h-full"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-white">
                <PlayCircle className="w-16 h-16 mb-4 opacity-50" />
                <p>Preview not available</p>
              </div>
            )}

            <button
              onClick={() => {
                setPreviewVideo(null);
                setVideoError(false);
                document.body.style.overflow = "auto";
              }}
              className="absolute top-3 right-3 text-white bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors"
              aria-label="Close preview"
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
