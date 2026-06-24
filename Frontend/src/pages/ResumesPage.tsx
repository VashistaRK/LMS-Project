import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Download, Loader, AlertCircle, Lock, Check, AlertTriangle } from "lucide-react";
import { useAuthContext } from "../context/AuthProvider";
import { toast } from "sonner";
import { LightGlassBg } from "@/components/ui/light-glass-bg";
import { GlowCard } from "@/components/ui/spotlight-card";
import { motion } from "framer-motion";
import { PageHero } from "@/components/ui/page-hero";

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

async function fetchResumes(): Promise<{ items: ResumeListItem[]; total: number }> {
  const res = await fetch(`${API}/api/resumes`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch resumes");
  return res.json();
}

async function fetchResume(resumeId: string) {
  const res = await fetch(`${API}/api/resumes/${resumeId}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch resume");
  return res.json();
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function ResumesPage() {
  const [, setPreviewContent] = useState<ResumeListItem | null>(null);
  const { user } = useAuthContext();
  const hasAccess = !!user?.accessGranted;
  const { data, isLoading, error } = useQuery({ queryKey: ["resumes"], queryFn: fetchResumes });
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
    <LightGlassBg className="text-zinc-900">
      <main className="relative z-10 min-h-screen pt-28 pb-8 max-w-[1440px] mx-auto px-6">
        <PageHero
          label="Resume Library"
          title={<>Resumes Library<span className="text-[#6366F1]">.</span></>}
          subtitle="Crafted to help you stand out, showcase your skills, and land interviews faster."
          image="assets/resumes-hero.png"
        >
          <div className="flex flex-wrap gap-3 mt-4">
            {["ATS-Friendly", "Industry-Ready", "Easy to Customize", "Instant Download"].map((label) => (
              <span key={label} className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-dmsans bg-white/40 border border-white/[0.08]">
                <Check className="w-4 h-4 mr-1.5 text-[#4edea3]" /> {label}
              </span>
            ))}
          </div>
        </PageHero>

        {/* Section header */}
        <div className="mb-8">
          <h2 className="font-satoshi text-2xl font-bold text-white mb-2">Available Resumes</h2>
          <p className="text-zinc-500 font-dmsans max-w-xl">
            Find your best-fit resume among our curated collection designed to land your dream job.
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-400 font-dmsans text-sm">Failed to load resumes</span>
          </div>
        )}

        {!hasAccess && (
          <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span className="text-amber-300 font-dmsans text-sm">Access restricted. Contact admin to grant download access.</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader className="w-8 h-8 text-[#6366F1] animate-spin" />
          </div>
        ) : resumes.length === 0 ? (
          <div className="text-center py-20 text-zinc-500 font-dmsans">No resumes available</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume, idx) => (
              <motion.div
                key={resume._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.06, 0.36), duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <GlowCard glowColor="blue" customSize className="!aspect-auto !p-0 group">
                  <div className="relative z-10">
                    {/* Image */}
                    <div
                      className="h-72 bg-white/40 flex items-center justify-center cursor-pointer rounded-t-2xl overflow-hidden"
                      onClick={() => openPreview(resume.resumeId)}
                    >
                      <img
                        src={resume.imageUrl || `${API}/api/resumes/${resume.resumeId}/image`}
                        alt="Resume preview"
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center p-4">
                      <div>
                        <h3 className="font-satoshi font-bold text-zinc-100 truncate">{resume.title || resume.resumeId}</h3>
                        <p className="text-xs text-zinc-500 font-jetbrains">{formatDate(resume.createdAt)}</p>
                      </div>
                      <button
                        onClick={() => {
                          if (!hasAccess) { toast.warning("Access should be granted by the admin"); return; }
                          downloadFile(resume.resumeId);
                        }}
                        className={`p-2.5 rounded-lg transition ${hasAccess ? "bg-[#6366F1] text-[#0d0096] hover:opacity-90" : "bg-zinc-700 text-zinc-600 cursor-not-allowed"}`}
                      >
                        {hasAccess ? <Download className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </GlowCard>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </LightGlassBg>
  );
}
