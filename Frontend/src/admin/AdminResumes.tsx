import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Trash2,
  Plus,
  FileText,
  Loader,
  AlertCircle,
  CheckCircle,
  Eye,
  Download,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface ResumeItem {
  _id: string;
  resumeId: string;
  title?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  authorName?: string;
  imageFileName?: string;
  createdAt: string;
  updatedAt: string;
}

async function fetchResumes(): Promise<ResumeItem[]> {
  const res = await fetch(`${API}/api/resumes`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to load resumes");
  const data = await res.json();
  return data.items || [];
}

async function uploadResume(formData: FormData) {
  const res = await fetch(`${API}/api/resumes/upload`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Upload failed");
  }
  return res.json();
}

async function deleteResume(resumeId: string) {
  const res = await fetch(`${API}/api/resumes/${resumeId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Delete failed");
}

async function fetchResumeDetail(resumeId: string) {
  const res = await fetch(`${API}/api/resumes/${resumeId}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to load resume details");
  return res.json();
}

function formatSize(bytes: number = 0) {
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(2)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminResumesPage() {
  const qc = useQueryClient();

  const [modal, setModal] = useState(false);
  const [docId, setDocId] = useState("");
  const [title, setTitle] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<ResumeItem | null>(null);

  const {
    data: resumes = [],
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ["admin-resumes"],
    queryFn: fetchResumes,
  });

  const uploadMutation = useMutation({
    mutationFn: uploadResume,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-resumes"] });
      setModal(false);
      setDocId("");
      setTitle("");
      setAuthorName("");
      setSelectedFile(null);
      setSelectedImage(null);
      setSuccess("Resume uploaded successfully!");
      setTimeout(() => setSuccess(""), 3000);
    },
    onError: (err: Error) => {
      setError(err.message || "Failed to upload resume");
      setTimeout(() => setError(""), 5000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteResume,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-resumes"] });
      setPreview(null);
      setSuccess("Resume deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    },
    onError: (err: Error) => {
      setError(err.message || "Failed to delete resume");
      setTimeout(() => setError(""), 5000);
    },
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docId.trim()) {
      setError("Resume ID is required");
      setTimeout(() => setError(""), 3000);
      return;
    }
    if (!selectedFile) {
      setError("Please upload a file");
      setTimeout(() => setError(""), 3000);
      return;
    }

    const form = new FormData();
    form.append("resumeId", docId.trim());
    form.append("title", title.trim() || docId.trim());
    form.append("authorName", authorName.trim());
    form.append("file", selectedFile);
    if (selectedImage) form.append("image", selectedImage);

    uploadMutation.mutate(form);
  };

  const loadPreview = async (resumeId: string) => {
    try {
      const data = await fetchResumeDetail(resumeId);
      setPreview(data);
      setError("");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load preview";
      setError(errorMessage);
      setTimeout(() => setError(""), 5000);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Admin – Resume Manager
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Upload, preview and delete resumes
          </p>
        </div>

        <button
          onClick={() => {
            setModal(true);
            setDocId("");
            setTitle("");
            setAuthorName("");
            setSelectedFile(null);
            setSelectedImage(null);
          }}
          className="w-full sm:w-auto px-4 md:px-5 py-2 md:py-2.5 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 flex items-center justify-center gap-2 text-sm md:text-base"
        >
          <Plus className="w-4 h-4 md:w-5 md:h-5" /> Upload Resume
        </button>
      </div>

      {success && (
        <div className="p-3 md:p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 md:gap-3 mb-4 md:mb-6 text-sm md:text-base">
          <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-3 md:p-4 bg-red-50 border-red-300 rounded-lg flex items-center gap-2 md:gap-3 mb-4 text-sm md:text-base">
          <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-red-700 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!error && queryError && (
        <div className="p-3 md:p-4 bg-red-50 border-red-300 rounded-lg flex items-center gap-2 md:gap-3 mb-4 text-sm md:text-base">
          <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-red-700 shrink-0" />
          Failed to load resumes
        </div>
      )}

      {/* Upload Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-4 md:p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4">
              Upload Resume
            </h2>

            <form onSubmit={handleUpload} className="space-y-3 md:space-y-4">
              <div>
                <label className="text-sm font-medium">Resume ID</label>
                <input
                  className="w-full border p-2 rounded mt-1 text-sm md:text-base"
                  value={docId}
                  onChange={(e) => setDocId(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border p-2 rounded mt-1 text-sm md:text-base"
                  placeholder="Resume title (optional)"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Author Name</label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full border p-2 rounded mt-1 text-sm md:text-base"
                  placeholder="Author name (optional)"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Resume File</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full mt-2 text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  Template Image (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setSelectedImage(e.target.files?.[0] || null)
                  }
                  className="w-full mt-2 text-sm"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setModal(false)}
                  className="flex-1 py-2 border rounded-lg text-sm md:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadMutation.isPending}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm md:text-base"
                >
                  {uploadMutation.isPending ? "Uploading..." : "Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Resume List */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="text-center py-8 md:py-12">
              <Loader className="w-6 h-6 md:w-8 md:h-8 animate-spin text-blue-600 mx-auto" />
            </div>
          ) : (
            <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px]">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="p-2 md:p-3 text-left text-xs md:text-sm">
                        Name
                      </th>
                      <th className="p-2 md:p-3 text-left text-xs md:text-sm hidden sm:table-cell">
                        Author
                      </th>
                      <th className="p-2 md:p-3 text-left text-xs md:text-sm hidden md:table-cell">
                        Uploaded
                      </th>
                      <th className="p-2 md:p-3 text-right text-xs md:text-sm">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y">
                    {resumes.map((r) => (
                      <tr key={r._id}>
                        <td className="p-2 md:p-3">
                          <div className="flex items-center gap-2 md:gap-3">
                            {/* thumbnail if available */}
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-50 rounded overflow-hidden flex items-center justify-center shrink-0">
                              <img
                                src={`${API}/api/resumes/${r.resumeId}/image`}
                                alt="template"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display =
                                    "none";
                                }}
                              />
                            </div>
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="w-3 h-3 md:w-4 md:h-4 text-blue-600 shrink-0" />
                              <span className="text-xs md:text-sm truncate">
                                {r.title || r.resumeId}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="p-2 md:p-3 text-gray-600 text-xs md:text-sm hidden sm:table-cell">
                          {r.authorName || "-"}
                        </td>

                        <td className="p-2 md:p-3 text-gray-600 text-xs md:text-sm hidden md:table-cell">
                          {formatDate(r.createdAt)}
                        </td>

                        <td className="p-2 md:p-3 text-right">
                          <div className="flex items-center justify-end gap-1 md:gap-2">
                            <button
                              className="p-1.5 md:p-2 text-blue-600 hover:bg-blue-50 rounded"
                              onClick={() => loadPreview(r.resumeId)}
                              aria-label="Preview"
                            >
                              <Eye className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            </button>

                            <button
                              className="p-1.5 md:p-2 text-red-600 hover:bg-red-50 rounded"
                              onClick={() => deleteMutation.mutate(r.resumeId)}
                              disabled={deleteMutation.isPending}
                              aria-label="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            </button>
                          </div>
                          {r.createdAt && (
                            <div className="text-xs text-gray-500 mt-1 md:hidden">
                              {formatDate(r.createdAt)}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white border rounded-xl shadow-sm p-3 md:p-4 lg:sticky lg:top-4">
            {preview ? (
              <>
                <div className="mb-3 md:mb-4">
                  <img
                    src={`${API}/api/resumes/${preview.resumeId}/image`}
                    alt="template"
                    className="w-full max-h-64 object-contain rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
                <h3 className="text-base md:text-lg font-bold mb-2">
                  {preview.title || preview.resumeId}
                </h3>

                <div className="text-xs md:text-sm text-gray-700 space-y-1 mb-3 md:mb-4">
                  <p>
                    <strong>File:</strong> {preview.fileName}
                  </p>
                  <p>
                    <strong>Type:</strong> {preview.fileType}
                  </p>
                  <p>
                    <strong>Size:</strong> {formatSize(preview.fileSize)}
                  </p>
                  <p>
                    <strong>Updated:</strong> {formatDate(preview.updatedAt)}
                  </p>
                </div>

                <button
                  onClick={() =>
                    window.open(
                      `${API}/api/resumes/${preview.resumeId}/download`,
                      "_blank"
                    )
                  }
                  className="w-full py-2 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 text-sm md:text-base"
                >
                  <Download className="w-4 h-4" /> Download
                </button>
              </>
            ) : (
              <div className="text-center text-gray-500 p-6 md:p-8">
                <Eye className="w-8 h-8 md:w-10 md:h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm md:text-base">
                  Select a resume to preview
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
