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
  authorName?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [success, setSuccess] = useState("");
  const [preview, setPreview] = useState<ResumeItem | null>(null);

  const {
    data: resumes = [],
    isLoading,
    error,
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
      setSelectedFile(null);
      setSuccess("Resume uploaded successfully!");
      setTimeout(() => setSuccess(""), 3000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteResume,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-resumes"] });
      setSuccess("Resume deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    },
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docId) return alert("Resume ID is required");
    if (!selectedFile) return alert("Please upload a file");

    const form = new FormData();
    form.append("resumeId", docId);
    form.append(
      "title",
      (document.getElementById("title") as HTMLInputElement)?.value || docId
    );
    form.append(
      "authorName",
      (document.getElementById("author") as HTMLInputElement)?.value || ""
    );
    form.append("file", selectedFile);

    uploadMutation.mutate(form);
  };

  const loadPreview = async (resumeId: string) => {
    try {
      const data = await fetchResumeDetail(resumeId);
      setPreview(data);
    } catch {
      alert("Failed to load preview");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin – Resume Manager</h1>
          <p className="text-gray-600 mt-1">Upload, preview and delete resumes</p>
        </div>

        <button
          onClick={() => {
            setModal(true);
            setDocId("");
            setSelectedFile(null);
          }}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Upload Resume
        </button>
      </div>

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 mb-6">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border-red-300 rounded-lg flex items-center gap-3 mb-4">
          <AlertCircle className="w-5 h-5 text-red-700" />
          Failed to load resumes
        </div>
      )}

      {/* Upload Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">Upload Resume</h2>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Resume ID</label>
                <input
                  className="w-full border p-2 rounded mt-1"
                  value={docId}
                  onChange={(e) => setDocId(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Title</label>
                <input id="title" className="w-full border p-2 rounded mt-1" />
              </div>

              <div>
                <label className="text-sm font-medium">Author Name</label>
                <input id="author" className="w-full border p-2 rounded mt-1" />
              </div>

              <div>
                <label className="text-sm font-medium">Resume File</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full mt-2"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setModal(false)}
                  className="flex-1 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadMutation.isPending}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg"
                >
                  {uploadMutation.isPending ? "Uploading..." : "Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resume List */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="text-center py-12">
              <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
            </div>
          ) : (
            <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Author</th>
                    <th className="p-3 text-left">Uploaded</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {resumes.map((r) => (
                    <tr key={r._id}>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          {r.title || r.resumeId}
                        </div>
                      </td>

                      <td className="p-3 text-gray-600">{r.authorName || "—"}</td>

                      <td className="p-3 text-gray-600">
                        {formatDate(r.createdAt)}
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            onClick={() => loadPreview(r.resumeId)}
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                            onClick={() => deleteMutation.mutate(r.resumeId)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white border rounded-xl shadow-sm p-4 sticky top-6">
            {preview ? (
              <>
                <h3 className="text-lg font-bold mb-1">
                  {preview.title || preview.resumeId}
                </h3>

                <p className="text-sm text-gray-600 mb-3">
                  Author: {preview.authorName || "—"}
                </p>

                <div className="text-sm text-gray-700 space-y-1 mb-4">
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
                  className="w-full py-2 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download
                </button>
              </>
            ) : (
              <div className="text-center text-gray-500 p-8">
                <Eye className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                Select a resume to preview
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
