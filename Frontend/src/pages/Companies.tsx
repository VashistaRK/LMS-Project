import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthProvider";
import { Lock, Search, ArrowRight, ChevronLeft, ChevronRight, Building2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { DarkGradientBg } from "@/components/ui/elegant-dark-pattern";
import { GlowCard } from "@/components/ui/spotlight-card";
import { PageHero } from "@/components/ui/page-hero";
import { LogoCloud } from "@/components/ui/logo-cloud-3";
import TestimonialSlider from "@/components/ui/testimonial-slider";

const COMPANY_LOGOS = [
  { src: "https://svgl.app/library/google.svg", alt: "Google" },
  { src: "https://svgl.app/library/microsoft.svg", alt: "Microsoft" },
  { src: "https://svgl.app/library/github_wordmark_light.svg", alt: "GitHub" },
  { src: "https://svgl.app/library/vercel_wordmark.svg", alt: "Vercel" },
  { src: "https://svgl.app/library/nvidia-wordmark-light.svg", alt: "Nvidia" },
  { src: "https://svgl.app/library/openai_wordmark_light.svg", alt: "OpenAI" },
  { src: "https://svgl.app/library/supabase_wordmark_light.svg", alt: "Supabase" },
  { src: "https://svgl.app/library/claude-ai-wordmark-icon_light.svg", alt: "Claude AI" },
];

type Company = {
  name: string;
  slug: string;
  description?: string;
  years?: number[];
};

const PAGE_SIZE = 24;

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const { user } = useAuthContext();
  const hasAccess = !!user?.accessGranted;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get("/api/companies");
        if (!cancelled) setCompanies(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return companies;
    const q = search.toLowerCase();
    return companies.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
    );
  }, [companies, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    if (currentPage >= totalPages) setCurrentPage(Math.max(0, totalPages - 1));
  }, [filtered, currentPage, totalPages]);

  const paginated = filtered.slice(
    currentPage * PAGE_SIZE,
    (currentPage + 1) * PAGE_SIZE
  );

  const handleCardClick = (c: Company) => {
    if (!hasAccess) {
      toast.warning("Access should be granted by the admin");
      return;
    }
    navigate(`/companies/${c.slug}`);
  };

  return (
    <DarkGradientBg className="text-[#e5e1e4]">

      <main className="relative z-10 w-full max-w-[1440px] mx-auto px-6 py-8">
        {/* Hero Section */}
        <PageHero
          label={loading ? "COMPANIES" : `${filtered.length} COMPANIES`}
          title={<>Top Companies<span className="text-[#c0c1ff]">.</span></>}
          subtitle="Explore comprehensive interview archives and coding patterns from the world's leading engineering teams."
          image="assets/companies-hero.png"
        >
          <a href="#" className="inline-flex items-center gap-2 font-jetbrains text-xs text-[#c0c1ff] uppercase tracking-[0.2em] mb-6 border-b border-[#c0c1ff]/30 pb-1 hover:border-[#c0c1ff] transition-colors">
            Self-Training Guidance <span className="text-sm">↗</span>
          </a>
          <div className="border-l-2 border-[#c0c1ff]/30 pl-6 mb-8 max-w-2xl">
            <p className="font-jetbrains text-sm text-zinc-300 uppercase tracking-wide leading-relaxed mb-4">
              "Practice with real papers. Crack real interviews."
            </p>
            <p className="font-dmsans text-sm text-zinc-500 leading-relaxed">
              Unlock your potential by leveraging resources from <span className="text-zinc-300 underline decoration-zinc-600">leading organizations</span>. Each company offers unique programs, tools, and learning paths designed to help you excel. Take charge of your professional journey with <span className="text-zinc-300 underline decoration-zinc-600">structured self-paced learning</span> and previous year question papers from renowned institutions.
            </p>
          </div>
          <div className="flex gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="font-satoshi text-2xl font-bold text-white">50+</span>
              <span className="font-jetbrains text-[10px] text-zinc-500 uppercase">Companies</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="font-satoshi text-2xl font-bold text-white">200+</span>
              <span className="font-jetbrains text-[10px] text-zinc-500 uppercase">Papers</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="font-satoshi text-2xl font-bold text-white">5+</span>
              <span className="font-jetbrains text-[10px] text-zinc-500 uppercase">Years</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="font-satoshi text-2xl font-bold text-white">94%</span>
              <span className="font-jetbrains text-[10px] text-zinc-500 uppercase">Success</span>
            </div>
          </div>
        </PageHero>

        {/* Logo Cloud */}
        <section className="mb-12 max-w-3xl">
          <p className="text-center font-dmsans text-sm text-zinc-500 mb-2">
            <span className="text-zinc-600">Trusted by top companies.</span>{" "}
            <span className="font-semibold text-zinc-400">Practice with real papers.</span>
          </p>
          <div className="h-px bg-white/5 [mask-image:linear-gradient(to_right,transparent,black,transparent)] mb-1" />
          <LogoCloud logos={COMPANY_LOGOS} />
          <div className="h-px bg-white/5 [mask-image:linear-gradient(to_right,transparent,black,transparent)]" />
        </section>

        {/* Search Bar */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="relative w-full md:w-[480px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#908fa0]" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(0);
              }}
              className="w-full h-12 pl-12 pr-4 bg-[#201f22]/50 backdrop-blur-md border border-[#464554] rounded-lg font-dmsans text-[15px] text-[#e5e1e4] outline-none transition-all focus:ring-2 focus:ring-[#c0c1ff]/20 focus:border-[#c0c1ff] placeholder:text-[#908fa0]"
              placeholder="Search companies, tech stacks, or domains..."
            />
          </div>
        </motion.section>

        {/* Company Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 8 }).map((_, idx) => (
                <div
                  key={`skeleton-${idx}`}
                  className="rounded-xl p-4 border border-white/[0.08] bg-[#18181b]/40 backdrop-blur-xl"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-white/5 rounded-lg animate-pulse" />
                    <div className="flex gap-1">
                      <div className="w-10 h-5 bg-[#353437] rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="h-6 bg-[#353437] rounded animate-pulse w-3/4 mb-2" />
                  <div className="h-4 bg-[#353437] rounded animate-pulse w-full mb-4" />
                  <div className="h-px bg-white/5 w-full mb-4" />
                  <div className="h-4 bg-[#353437] rounded animate-pulse w-1/3" />
                </div>
              ))
            : paginated.map((c, idx) => (
                <motion.div
                  key={c.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: Math.min(idx * 0.06, 0.48),
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <GlowCard
                    glowColor="purple"
                    customSize
                    className={`!aspect-auto !p-0 group overflow-hidden transition-all duration-300
                      ${hasAccess ? "cursor-pointer hover:-translate-y-1" : "cursor-not-allowed opacity-50"}
                    `}
                    onClick={() => handleCardClick(c)}
                  >
                    <div className="relative p-5 flex flex-col h-full z-10">
                      {/* Locked overlay */}
                      {!hasAccess && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/50 backdrop-blur-[2px] rounded-2xl">
                          <Lock className="w-5 h-5 text-[#c0c1ff] mb-2" />
                          <span className="font-jetbrains text-[10px] text-[#c0c1ff] tracking-widest uppercase">
                            ACCESS REQUIRED
                          </span>
                        </div>
                      )}

                      {/* Card header */}
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center border border-white/5">
                          <span className="font-satoshi text-lg font-bold text-[#c0c1ff]/60">
                            {c.name.charAt(0)}
                          </span>
                        </div>
                        {c.years && c.years.length > 0 && (
                          <div className="flex gap-1">
                            {c.years.slice(0, 3).map((y) => (
                              <span
                                key={y}
                                className="font-jetbrains text-[10px] bg-[#353437] px-2 py-0.5 rounded text-[#c7c4d7]"
                              >
                                {y}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Card body */}
                      <h3 className="font-satoshi text-2xl font-semibold tracking-[-0.02em] leading-[1.3] mb-1">
                        {c.name}
                      </h3>
                      {c.description && (
                        <p className="font-dmsans text-[13px] leading-relaxed text-[#908fa0] mb-4">
                          {c.description}
                        </p>
                      )}

                      {/* Divider + Link */}
                      <div className="mt-auto">
                        <div className="h-px bg-white/5 w-full mb-4" />
                        {hasAccess ? (
                          <span className="inline-flex items-center text-[#c0c1ff] font-jetbrains text-xs group-hover:gap-2 transition-all">
                            View Papers
                            <ArrowRight className="w-3.5 h-3.5 ml-1" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[#908fa0] font-jetbrains text-xs">
                            View Papers
                            <Lock className="w-3 h-3 ml-1" />
                          </span>
                        )}
                      </div>
                    </div>
                  </GlowCard>
                </motion.div>
              ))}
        </div>

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/[0.08]">
              <Building2 className="w-7 h-7 text-[#908fa0]" />
            </div>
            <h3 className="font-satoshi text-lg font-semibold text-[#e5e1e4] mb-1">
              No Companies Found
            </h3>
            <p className="font-dmsans text-sm text-[#908fa0]">
              {search
                ? "Try a different search term."
                : "Check back soon for company papers."}
            </p>
          </motion.div>
        )}

        {/* Pagination */}
        {!loading && filtered.length > PAGE_SIZE && (
          <motion.footer
            className="mt-20 flex justify-between items-center py-6 border-t border-white/5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="font-jetbrains text-xs text-[#908fa0] uppercase tracking-wider">
              Page{" "}
              <span className="text-[#e5e1e4]">
                {String(currentPage + 1).padStart(2, "0")}
              </span>{" "}
              / {String(totalPages).padStart(2, "0")}
            </div>
            <div className="flex gap-4">
              <button
                className="px-6 py-2 border border-[#464554] rounded-lg font-jetbrains text-xs text-[#c7c4d7] hover:bg-white/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                PREV
              </button>
              <button
                className="px-6 py-2 bg-[#c0c1ff] text-[#0d0096] rounded-lg font-jetbrains text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages - 1))
                }
                disabled={currentPage >= totalPages - 1}
              >
                NEXT
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.footer>
        )}
      </main>

      <TestimonialSlider />
    </DarkGradientBg>
  );
}
