import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Download,
  Loader,
  AlertCircle,
  Lock,
  Check,
  AlertTriangle,
} from "lucide-react";
import { useAuthContext } from "../context/AuthProvider";
import { toast } from "sonner";

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
  const { user } = useAuthContext();
  const hasAccess = !!user?.accessGranted;

  const { data, isLoading, error } = useQuery({
    queryKey: ["resumes"],
    queryFn: fetchResumes,
  });

  const resumes = data?.items || [];

  const openPreview = async (resumeId: string) => {
    try {
      console.log("Fetching resume preview for ID:", user);
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
    <div className="min-h-screen py-12 max-w-7xl mx-6 md:mx-6 xl:mx-auto">
      {/* Header */}
      <div className="mb-12 py-32 flex flex-col items-center justify-center space-y-8 font-mulish tracking-tighter leading-tight">
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900">
            Resumes Library.
          </h1>

          <p className="text-3xl md:text-5xl text-gray-500 max-w-6xl font-bold">
            Crafted to help you stand out, showcase your skills, and land
            interviews faster.
          </p>
        </div>

        {/* Info badges */}
        <div className="flex flex-col items-center md:flex-row gap-3">
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium">
            <Check className="w-4 h-4 mr-1 text-green-500" /> ATS-Friendly
          </span>
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium">
            <Check className="w-4 h-4 mr-1 text-green-500" /> Industry-Ready
          </span>
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium">
            <Check className="w-4 h-4 mr-1 text-green-500" /> Easy to Customize
          </span>
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium">
            <Check className="w-4 h-4 mr-1 text-green-500" /> Instant Download
          </span>
        </div>
      </div>

      <div className="max-w-xl mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Available Resumes
        </h2>
        <p>
          Find your best-fit resume among our curated collection, designed to
          help you land your dream job. Each template is crafted to highlight
          your skills, experience, and achievements in a way that stands out to
          recruiters and ATS systems alike.
        </p>
      </div>

      {error && (
        <div className="mb-12 p-6 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
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
          {!hasAccess && (
            <div>
              <div className="mt-12 p-6 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <span className="text-yellow-800">
                  Access to downloads is restricted. Please contact
                  support/admin to grant access.
                </span>
              </div>
            </div>
          )}
          {/* ✅ Resume Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-14 gap-6">
            {resumes.map((resume) => (
              <div
                key={resume._id}
                className="transition overflow-hidden group"
              >
                {/* Image */}
                <div
                  className="h-10/12 bg-white flex items-center rounded-xl justify-center cursor-pointer"
                  onClick={() => openPreview(resume.resumeId)}
                >
                  <img
                    src={
                      resume.imageUrl ||
                      `${API}/api/resumes/${resume.resumeId}/image`
                    }
                    alt="Resume preview"
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>

                {/* Content */}
                <div className="w-full flex justify-between items-center">
                  <div className="flex flex-col p-4">
                    <h3 className="font-bold text-gray-900 truncate">
                      {resume.title || resume.resumeId}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {formatDate(resume.createdAt)}
                    </p>
                  </div>

                  {/* Actions */}

                  <button
                    onClick={() => {
                      if (!hasAccess) {
                        toast.warning("Access should be granted by the admin");
                        return;
                      }
                      downloadFile(resume.resumeId);
                    }}
                    className={`w-fit inline-flex items-center justify-center gap-1 px-3 py-2 text-sm ${hasAccess ? "bg-[#0AC4E0] hover:bg-[#0992C2]" : "bg-zinc-400 cursor-not-allowed"} text-white rounded-md`}
                  >
                    {hasAccess ? (
                      <>
                        <Download className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Optional Preview Modal (future enhancement) */}
        </>
      )}
    </div>
  );
}
