import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { FileText, Download, Eye, Loader, AlertCircle } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface ResumeListItem {
  _id: string;
  resumeId: string;
  title?: string;
  authorName?: string;
  summary?: string;
  tags?: string[];
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  createdAt: string;
  updatedAt: string;
}

async function fetchResumes(): Promise<{ items: ResumeListItem[]; total: number }> {
  const res = await fetch(`${API}/api/resumes`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch resumes");
  return res.json();
}

async function fetchResume(resumeId: string) {
  const res = await fetch(`${API}/api/resumes/${encodeURIComponent(resumeId)}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch resume");
  return res.json();
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ResumesPage() {
  const [previewId, setPreviewId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["resumes"],
    queryFn: fetchResumes,
  });

  const resumes = data?.items || [];

  const [previewContent, setPreviewContent] = useState<ResumeListItem | null>(null);

  const loadPreview = async (resumeId: string) => {
    setPreviewId(resumeId);
    setPreviewContent(null);
    try {
      const r = await fetchResume(resumeId);
      setPreviewContent(r);
    } catch (err) {
      console.error(err);
      alert("Failed to load resume preview");
    }
  };

  const downloadFile = (resumeId: string) => {
    window.open(`${API}/api/resumes/${resumeId}/download`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <FileText className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Resumes Library</h1>
          </div>
          <p className="text-lg text-gray-600">
            Browse and download sample resumes to enhance your profile
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">Failed to load resumes</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : resumes.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No resumes available yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Resume List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-800">
                    Available Resumes ({resumes.length})
                  </h2>
                </div>
                <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                  {resumes.map((resume) => (
                    <button
                      key={resume._id}
                      onClick={() => loadPreview(resume.resumeId)}
                      className={`w-full text-left p-4 transition-all hover:bg-blue-50 ${
                        previewId === resume.resumeId
                          ? "bg-blue-100 border-l-4 border-blue-600"
                          : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {resume.title || resume.resumeId}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {resume.authorName || "—"}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {formatDate(resume.createdAt)}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="lg:col-span-2">
              {previewContent ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
                  {/* Preview Header */}
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {previewContent.title || previewContent.resumeId}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {previewContent.authorName || "—"} • Updated{" "}
                        {previewContent.updatedAt
                          ? formatDate(previewContent.updatedAt)
                          : "N/A"}
                      </p>
                    </div>

                    <button
                      onClick={() => downloadFile(previewContent.resumeId)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>

                  {/* Metadata */}
                  <div className="flex-1 p-4 bg-gray-50 text-sm text-gray-700 space-y-2">
                    <p><strong>Resume ID:</strong> {previewContent.resumeId}</p>
                    <p><strong>File Name:</strong> {previewContent.fileName}</p>
                    <p><strong>Type:</strong> {previewContent.fileType}</p>
                    <p><strong>Size:</strong> {(previewContent.fileSize! / 1024).toFixed(2)} KB</p>
                    <p><strong>Summary:</strong> {previewContent.summary || "—"}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center h-full text-center">
                  <Eye className="w-12 h-12 text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">Select a resume to preview</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
