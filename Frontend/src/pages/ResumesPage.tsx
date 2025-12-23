import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Download, Loader, AlertCircle } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface ResumeListItem {
  _id: string;
  resumeId: string;
  title?: string;
  authorName?: string;
  summary?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

async function fetchResumes(): Promise<{
  items: ResumeListItem[];
  total: number;
}> {
  const res = await fetch(`${API}/api/resumes`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch resumes");
  return res.json();
}

async function fetchResume(resumeId: string) {
  const res = await fetch(`${API}/api/resumes/${resumeId}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch resume");
  return res.json();
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ResumesPage() {
  const [, setPreviewContent] = useState<ResumeListItem | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["resumes"],
    queryFn: fetchResumes,
  });

  const resumes = data?.items || [];

  const openPreview = async (resumeId: string) => {
    try {
      const r = await fetchResume(resumeId);
      setPreviewContent(r);
    } catch {
      alert("Failed to load resume preview");
    }
  };

  const downloadFile = (resumeId: string) => {
    window.open(`${API}/api/resumes/${resumeId}/download`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
              Resume Library
            </h1>
          </div>

          <p className="text-lg text-gray-700 max-w-3xl leading-relaxed">
            Discover a curated collection of professionally designed resume
            templates crafted to help you stand out, showcase your skills, and
            land interviews faster.
          </p>

          {/* Info badges */}
          <div className="flex flex-wrap gap-3 mt-5">
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100">
              ✔ ATS-Friendly
            </span>
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-100">
              ✔ Industry-Ready
            </span>
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-purple-50 text-purple-700 border border-purple-100">
              ✔ Easy to Customize
            </span>
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-orange-50 text-orange-700 border border-orange-100">
              ✔ Instant Download
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">Failed to load resumes</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : resumes.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No resumes available
          </div>
        ) : (
          <>
            {/* ✅ Resume Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {resumes.map((resume) => (
                <div
                  key={resume._id}
                  className="bg-white rounded-xl shadow-sm border hover:shadow-md transition overflow-hidden group"
                >
                  {/* Image */}
                  <div
                    className="h-9/12 bg-gray-100 flex items-center justify-center cursor-pointer"
                    onClick={() => openPreview(resume.resumeId)}
                  >
                    <img
                      src={
                        resume.imageUrl ||
                        `${API}/api/resumes/${resume.resumeId}/image`
                      }
                      alt="Resume preview"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {resume.title || resume.resumeId}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">
                      {resume.authorName || "—"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(resume.createdAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="px-4 pb-4 flex gap-2">
                    <button
                      onClick={() => downloadFile(resume.resumeId)}
                      className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                    >
                      <Download className="w-4 h-4" /> Download
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Optional Preview Modal (future enhancement) */}
          </>
        )}
      </div>
    </div>
  );
}
