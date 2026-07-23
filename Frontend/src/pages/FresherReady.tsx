/* eslint-disable */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuthContext } from "../context/AuthProvider";
import { Lock, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { LightGlassBg } from "@/components/ui/light-glass-bg";
import { GlowCard } from "@/components/ui/spotlight-card";
import { PageHero } from "@/components/ui/page-hero";
import TestimonialSlider from "@/components/ui/testimonial-slider";

export default function FreshersReady() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const hasAccess = !!user?.accessGranted;

  const [tracks, setTracks] = useState<
    Array<{ title: string; description: string; slug: string }>
  >([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get<
          Array<{ title: string; description: string; slug: string }>
        >(`/api/assessments/tracks`);
        if (!cancelled) setTracks(res.data || []);
      } catch (err) {
        if (!cancelled) console.error("Failed to load tracks", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const tabs = [
    { key: "communication", label: "Communication", id: "communication" },
    { key: "aptitude", label: "DSA & Logic", id: "logical-aptitude" },
    { key: "technical", label: "Technical", id: "technical-skills" },
  ];

  const tabHeroContent: Record<
    string,
    { heading: string; sub: string; image: string }
  > = {
    communication: {
      heading: "Master Communication.",
      sub: "Ace interviews with verbal, written, and presentation practice modules.",
      image: "assets/communication-hero.png",
    },
    aptitude: {
      heading: "Elevate Your Engineering Score.",
      sub: "Systematic technical prep. Real-world scenarios, rigorous testing, and precise data feedback.",
      image: "assets/courses-hero.png",
    },
    technical: {
      heading: "Build With Modern Tech.",
      sub: "Hands-on coding, system design, and core CS fundamentals for placement rounds.",
      image: "assets/courses-hero.png",
    },
  };

  const tabContent: Record<
    string,
    {
      whyTitle: string;
      whyDesc: string;
      tips: string[];
      ctaTitle: string;
      ctaDesc: string;
      trainingTitle: string;
      trainingBullets: string[];
    }
  > = {
    communication: {
      whyTitle: "Why Communication Skills Matter",
      whyDesc:
        "Effective communication is the cornerstone of professional success. The ability to articulate ideas clearly, listen actively, and adapt your message to different audiences is invaluable.",
      tips: [
        "Practice active listening — understanding others is as important as being understood",
        "Develop clarity in written communication — emails and reports reflect your professionalism",
        "Master verbal articulation — speak confidently in meetings and presentations",
        "Build emotional intelligence — read the room and adapt your style",
        "Embrace feedback — constructive criticism refines your approach",
      ],
      ctaTitle: "Wanna ace your interviews?",
      ctaDesc:
        "Try our AI Bot — simulates real interview scenarios with personalized feedback. Like a personal coach 24/7 to boost your confidence before the big day.",
      trainingTitle: "Self-Training Guidance",
      trainingBullets: [
        "AI-driven interview training adapted to your communication proficiency",
        "Multi-domain practice covering HR, technical, and real-world scenarios",
        "Instant feedback that identifies mistakes and suggests precise corrections",
        "Continuous improvement insights to strengthen confidence and performance",
      ],
    },
    aptitude: {
      whyTitle: "Why Logical & Aptitude Skills Matter",
      whyDesc:
        "Aptitude and reasoning form the gateway to most placement rounds. Strong numerical, logical, and verbal reasoning unlocks tier-1 companies and high-paying roles.",
      tips: [
        "Master speed math — shortcuts beat formulas under time pressure",
        "Practice pattern recognition — series, analogies, syllogisms recur every test",
        "Solve real previous-year papers — companies repeat question templates",
        "Time yourself daily — accuracy under pressure separates top scorers",
        "Track weak topics — focused weak-area drills compound faster than broad practice",
      ],
      ctaTitle: "Wanna crack the aptitude round?",
      ctaDesc:
        "Try our AI Tutor — adaptive aptitude drills, instant solutions, and weak-topic insights. Practice the exact pattern your dream company asks.",
      trainingTitle: "Self-Training Guidance",
      trainingBullets: [
        "Adaptive aptitude drills tuned to your accuracy and speed level",
        "Topic-wise practice across logic, math, verbal, and data interpretation",
        "Step-by-step solutions explaining the shortcut behind every answer",
        "Weak-area heatmaps that pinpoint exactly what to revise next",
      ],
    },
    technical: {
      whyTitle: "Why Technical Skills Matter",
      whyDesc:
        "Tech rounds decide your offer letter. Strong DSA, system design, and core CS fundamentals win interviews at product companies and unlock 2x salary jumps.",
      tips: [
        "Master the 75 must-do DSA problems before any interview",
        "Build 3 real projects end-to-end — depth beats breadth on resumes",
        "Practice system design fundamentals — scalability, caching, databases",
        "Solve coding problems daily — consistency builds pattern recognition",
        "Mock-interview weekly — interview skill ≠ coding skill",
      ],
      ctaTitle: "Wanna nail the coding round?",
      ctaDesc:
        "Try our AI Coach — live code review, complexity analysis, and personalized DSA paths. Practice with real FAANG-tier questions.",
      trainingTitle: "Self-Training Guidance",
      trainingBullets: [
        "Curated DSA roadmap from arrays to dynamic programming and beyond",
        "Hands-on coding labs covering frontend, backend, and full-stack tracks",
        "Real-time code review with complexity analysis and refactor hints",
        "Interview-style mock tests modeled on FAANG and Indian product giants",
      ],
    },
  };

  const [activeTab, setActiveTab] = useState<string>(tabs[0].key);
  const [items, setItems] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState<boolean>(false);
  const [itemsError, setItemsError] = useState<string | null>(null);

  const ITEMS_PER_PAGE = 12;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const paginatedItems = loadingItems
    ? Array.from({ length: 6 })
    : items.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
      );

  const defaultSlugs: Record<string, string> = {
    communication: "communication",
    aptitude: "logical-aptitude",
    technical: "technical-skills",
  };

  const resolveSlugForTab = (tabKey: string) => {
    const found = tracks.find(
      (t) => t.slug === tabKey || t.slug === defaultSlugs[tabKey],
    );
    if (found) return found.slug;
    const byTitle = tracks.find((t) =>
      t.title.toLowerCase().includes(tabKey.split("-")[0]),
    );
    if (byTitle) return byTitle.slug;
    return defaultSlugs[tabKey];
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingItems(true);
      setItemsError(null);
      try {
        const slug = resolveSlugForTab(activeTab);
        const testsRes = await api.get<any[]>(
          `/api/assessments/tracks/${slug}/tests`,
        );
        if (!cancelled) setItems(testsRes.data || []);
      } catch (err: any) {
        if (!cancelled) {
          setItems([]);
          setItemsError("Failed to load tests");
        }
      } finally {
        if (!cancelled) setLoadingItems(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeTab, tracks]);

  useEffect(() => {
    if (window.location.hash) {
      const hash = window.location.hash.replace("#", "");
      const tab = tabs.find((t) => t.id === hash);
      if (tab) setActiveTab(tab.key);
    }
  }, []);

  const hero = tabHeroContent[activeTab] || tabHeroContent.aptitude;

  return (
    <LightGlassBg className="text-zinc-900">
      {/* Hero */}
      <main className="relative z-10 pt-28 pb-8 px-6 md:px-10 max-w-7xl mx-auto">
        <PageHero
          label="Practice Session"
          title={<>{hero.heading}</>}
          subtitle={hero.sub}
          image={hero.image}
        >
          <a
            href="#"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#6366F1] mb-6 border-b border-[#6366F1]/30 pb-1 hover:border-[#6366F1] transition-colors"
          >
            My Attempts <span className="text-sm">↗</span>
          </a>
          <div className="border-l-2 border-[#6366F1]/30 pl-6 mb-8 max-w-2xl">
            <p className="text-base font-bold text-zinc-900 leading-relaxed mb-4">
              "Practice does not make perfect. Perfect practice makes perfect."
            </p>
            <p className="font-dmsans text-sm text-zinc-500 leading-relaxed">
              Sharpen your skills with{" "}
              <span className="text-zinc-700 underline decoration-zinc-600">
                topic-wise practice tests
              </span>{" "}
              that mirror real placement rounds. Track your mastery, build your
              streak, and identify weak areas before the interview — with{" "}
              <span className="text-zinc-700 underline decoration-zinc-600">
                instant feedback and detailed analytics
              </span>
              .
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="flex flex-shrink-0 items-center gap-2">
              <span className="font-satoshi text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl">
                156
              </span>
              <span className="font-jetbrains text-[11px] font-bold text-zinc-700 uppercase tracking-wider sm:text-xs">
                Tests
              </span>
            </div>
            <div className="hidden h-8 w-px bg-zinc-300 sm:block" />
            <div className="flex flex-shrink-0 items-center gap-2">
              <span className="font-satoshi text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl">
                12
              </span>
              <span className="font-jetbrains text-[11px] font-bold text-zinc-700 uppercase tracking-wider sm:text-xs">
                Topics
              </span>
            </div>
            <div className="hidden h-8 w-px bg-zinc-300 sm:block" />
            <div className="flex flex-shrink-0 items-center gap-2">
              <span className="font-satoshi text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl">
                45m
              </span>
              <span className="font-jetbrains text-[11px] font-bold text-zinc-700 uppercase tracking-wider sm:text-xs">
                Avg Duration
              </span>
            </div>
            <div className="hidden h-8 w-px bg-zinc-300 sm:block" />
            <div className="flex flex-shrink-0 items-center gap-2">
              <span className="font-satoshi text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl">
                87%
              </span>
              <span className="font-jetbrains text-[11px] font-bold text-zinc-700 uppercase tracking-wider sm:text-xs">
                Pass Rate
              </span>
            </div>
          </div>
        </PageHero>

        {/* Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-12">
          {[
            { label: "Mastery Level", value: "84.2", unit: "Percentile" },
            {
              label: "Tests Completed",
              value: String(items.length || "—"),
              unit: "Units",
            },
            { label: "Time Invested", value: "42.5", unit: "Hours" },
            { label: "Streak Value", value: "12", unit: "Days Active" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              className="p-4 sm:p-6 flex flex-col gap-1 rounded-none bg-white/60 backdrop-blur-xl border border-zinc-200/60"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: i * 0.06,
                duration: 0.4,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <span className="text-sm font-bold text-zinc-600">{s.label}</span>
              <div className="flex items-end gap-2">
                <span className="font-satoshi text-[24px] sm:text-[32px] font-bold tracking-[-0.03em] text-zinc-900 leading-[1.2]">
                  {s.value}
                </span>
                <span className="text-sm font-bold text-zinc-500 mb-1">
                  {s.unit}
                </span>
              </div>
            </motion.div>
          ))}
        </section>

        {/* Filter Tabs */}
        <section className="flex gap-3 mb-8 flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`relative px-6 py-3 text-base font-bold transition-all duration-200 ${
                activeTab === t.key
                  ? "bg-[#6366F1] text-white border-2 border-[#6366F1] shadow-[0_0_24px_rgba(192,193,255,0.4)]"
                  : "bg-white/40 border-2 border-zinc-300 text-zinc-700 hover:border-[#6366F1]/60 hover:text-zinc-900 hover:bg-white/60"
              }`}
            >
              {t.label}
            </button>
          ))}
        </section>

        {/* Educational Content: Why + Tips + CTA */}
        <section className="mb-16 grid lg:grid-cols-3 gap-6">
          {/* Why Matters */}
          <motion.div
            key={`why-${activeTab}`}
            className="lg:col-span-2 p-8 bg-white/60 backdrop-blur-xl border border-zinc-200/60"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="text-sm font-bold text-[#6366F1] mb-3 block">
              Foundation
            </span>
            <h2 className="font-satoshi text-3xl font-bold tracking-[-0.03em] text-zinc-900 mb-4">
              {tabContent[activeTab]?.whyTitle}
            </h2>
            <p className="font-dmsans text-[15px] text-zinc-600 leading-relaxed mb-8">
              {tabContent[activeTab]?.whyDesc}
            </p>

            <div className="border-t border-zinc-200/60 pt-6">
              <span className="text-sm font-bold text-emerald-600 mb-4 block">
                Tips to Master
              </span>
              <ul className="space-y-3">
                {tabContent[activeTab]?.tips.map((tip, i) => (
                  <motion.li
                    key={tip}
                    className="flex gap-4 items-start"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                  >
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center font-jetbrains text-[11px] text-[#6366F1]">
                      {i + 1}
                    </span>
                    <p className="font-dmsans text-sm text-zinc-700 leading-relaxed pt-1">
                      {tip}
                    </p>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* AI Bot CTA */}
          <motion.div
            key={`cta-${activeTab}`}
            className="relative overflow-hidden p-8 bg-gradient-to-br from-[#6366F1]/10 via-white/70 to-[#4edea3]/10 backdrop-blur-xl border border-[#6366F1]/20 flex flex-col justify-between"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#6366F1]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <span className="text-sm font-bold text-emerald-600 mb-3 block">
                AI Powered ↗
              </span>
              <h3 className="font-satoshi text-2xl font-bold tracking-[-0.02em] text-zinc-900 mb-3 leading-tight">
                {tabContent[activeTab]?.ctaTitle}
              </h3>
              <p className="font-dmsans text-sm text-zinc-600 leading-relaxed mb-6">
                {tabContent[activeTab]?.ctaDesc}
              </p>
            </div>

            {/* Robot mascot + speech bubble */}
            <div className="relative z-10 mb-6 flex items-start gap-3">
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="relative bg-zinc-900 text-white font-jetbrains text-xs font-semibold px-3 py-2 rounded-2xl rounded-bl-none shadow-lg"
              >
                Hi! Click Me
                <span className="absolute -bottom-1.5 left-3 w-3 h-3 bg-zinc-900 rotate-45" />
              </motion.div>
              <motion.img
                src="/assets/Ai-Bot-2.png"
                alt="AI Bot"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
                className="w-20 h-20 object-contain drop-shadow-[0_0_24px_rgba(192,193,255,0.4)]"
                animate={{ y: [0, -6, 0] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>

            <a
              href="https://talkivo.in/"
              className="relative z-10 inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#6366F1] text-white text-sm font-bold hover:opacity-90 transition-opacity"
            >
              Launch AI Tutor →
            </a>
          </motion.div>
        </section>

        {/* Self-Training Guidance */}
        <motion.section
          key={`training-${activeTab}`}
          className="mb-16 p-8 bg-white/60 backdrop-blur-xl border border-zinc-200/60"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-baseline justify-between mb-6 flex-wrap gap-2">
            <h3 className="font-satoshi text-2xl font-bold tracking-[-0.02em] text-zinc-900">
              {tabContent[activeTab]?.trainingTitle}
            </h3>
            <span className="font-jetbrains text-[10px] text-emerald-600 uppercase tracking-[0.1em]">
              SELF_PACED // AI_ASSISTED
            </span>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {tabContent[activeTab]?.trainingBullets.map((b, i) => (
              <motion.div
                key={b}
                className="flex gap-4 items-start p-4 border border-zinc-200/60 bg-white/40"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-jetbrains text-[10px] text-emerald-600">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="font-dmsans text-sm text-zinc-700 leading-relaxed">
                  {b}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Practice Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {paginatedItems.map((it: any, idx: number) => {
            const isLoading = !it || !it.testId;

            if (isLoading) {
              return (
                <div
                  key={`skeleton-${idx}`}
                  className="p-6 flex flex-col gap-6 bg-white/60 backdrop-blur-xl border border-zinc-200/60"
                >
                  <div className="w-16 h-5 bg-zinc-200 rounded-sm animate-pulse" />
                  <div>
                    <div className="h-7 bg-zinc-200 rounded animate-pulse w-3/4 mb-2" />
                    <div className="h-4 bg-zinc-200 rounded animate-pulse w-full" />
                  </div>
                  <div className="pt-4 border-t border-zinc-200/60 flex justify-between">
                    <div className="h-4 bg-zinc-200 rounded animate-pulse w-24" />
                    <div className="h-4 bg-zinc-200 rounded animate-pulse w-20" />
                  </div>
                </div>
              );
            }

            const questionsCount =
              it.questionsCount ?? it.questions?.length ?? "—";

            return (
              <motion.div
                key={it.testId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: Math.min(idx * 0.06, 0.36),
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <GlowCard
                  glowColor="purple"
                  customSize
                  className={`!aspect-auto !p-0 group overflow-hidden transition-all duration-300
                    ${hasAccess ? "cursor-pointer hover:-translate-y-1" : "cursor-not-allowed opacity-50"}
                  `}
                  onClick={() => {
                    if (!hasAccess) {
                      toast.warning("Access should be granted by the admin");
                      return;
                    }
                    navigate(
                      `/freshers-pratice/test/${
                        it.trackSlug ?? resolveSlugForTab(activeTab)
                      }/${it.testId}`,
                    );
                  }}
                >
                  <div className="relative p-6 flex flex-col gap-6 h-full z-10">
                    {/* Locked overlay */}
                    {!hasAccess && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/50 backdrop-blur-[2px] rounded-2xl">
                        <Lock className="w-5 h-5 text-[#6366F1] mb-2" />
                        <span className="font-jetbrains text-[10px] text-[#6366F1] tracking-widest uppercase">
                          ACCESS REQUIRED
                        </span>
                      </div>
                    )}

                    {/* Difficulty badge */}
                    <div className="flex justify-between items-start">
                      <div className="bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded-sm">
                        <span className="font-jetbrains text-[10px] text-[#6366F1] uppercase">
                          {activeTab === "technical"
                            ? "CODING"
                            : activeTab === "aptitude"
                              ? "LOGIC"
                              : "VERBAL"}
                        </span>
                      </div>
                    </div>

                    {/* Title + desc */}
                    <div>
                      <h3 className="font-satoshi text-2xl font-semibold tracking-[-0.02em] text-zinc-900 mb-2">
                        {it.title}
                      </h3>
                      <p className="font-dmsans text-[13px] text-zinc-500 leading-relaxed">
                        {it.description ||
                          `${questionsCount} questions to test your skills.`}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center pt-4 border-t border-zinc-200/60 mt-auto">
                      <span className="font-jetbrains text-sm text-zinc-600 uppercase">
                        {questionsCount} QUESTIONS
                      </span>
                      {hasAccess ? (
                        <button className="text-[#6366F1] font-jetbrains text-xs uppercase group-hover:underline">
                          Start_Now
                        </button>
                      ) : (
                        <span className="text-zinc-600 font-jetbrains text-xs uppercase">
                          LOCKED
                        </span>
                      )}
                    </div>
                  </div>
                </GlowCard>
              </motion.div>
            );
          })}
        </section>

        {/* Empty state */}
        {!loadingItems && items.length === 0 && !itemsError && (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-16 h-16 bg-white/40 rounded-lg flex items-center justify-center mx-auto mb-4 border border-zinc-200/60">
              <span className="font-satoshi text-2xl text-zinc-500">?</span>
            </div>
            <h3 className="font-satoshi text-lg font-semibold text-zinc-900 mb-1">
              No Tests Available
            </h3>
            <p className="font-dmsans text-sm text-zinc-500">
              No tests for this category yet. Check back soon.
            </p>
          </motion.div>
        )}

        {/* Pagination */}
        {!loadingItems && totalPages > 1 && (
          <motion.footer
            className="flex justify-between items-center py-6 border-t border-zinc-200/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="font-jetbrains text-xs text-zinc-500 uppercase tracking-wider">
              Page{" "}
              <span className="text-zinc-900">
                {String(currentPage).padStart(2, "0")}
              </span>{" "}
              / {String(totalPages).padStart(2, "0")}
            </div>
            <div className="flex gap-4">
              <button
                className="px-6 py-2 border border-zinc-300 font-jetbrains text-xs text-zinc-700 hover:bg-white/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                PREV
              </button>
              <button
                className="px-6 py-2 bg-[#6366F1] text-white font-jetbrains text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage >= totalPages}
              >
                NEXT
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.footer>
        )}

        {/* AI Tutor promo (communication tab only) */}
        {activeTab === "communication" && (
          <motion.section
            className="mt-16 p-8 bg-white/60 backdrop-blur-xl border border-zinc-200/60 rounded-none"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-sm font-bold text-emerald-600 mb-3 block">
                  AI Powered
                </span>
                <h2 className="font-satoshi text-3xl font-bold tracking-[-0.03em] text-zinc-900 mb-4">
                  Ace Interviews With AI Coach
                </h2>
                <p className="font-dmsans text-[15px] text-zinc-600 leading-relaxed mb-6">
                  AI Bot simulates real interview scenarios with personalized
                  feedback. Like a personal coach available 24/7.
                </p>
                <a
                  href="/Ai-Tutor"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#6366F1] text-white font-jetbrains text-xs font-medium uppercase hover:opacity-90 transition-opacity"
                >
                  LAUNCH_TUTOR
                </a>
              </div>
              <div>
                <a href="/Ai-Tutor">
                  <img
                    src="/assets/Ai-Bot-2.png"
                    alt="AI Tutor"
                    className="rounded-lg border border-zinc-200/60 w-full"
                  />
                </a>
              </div>
            </div>
          </motion.section>
        )}
      </main>

      <TestimonialSlider />

      {/* FAB */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={() => {
            if (!hasAccess) {
              toast.warning("Access should be granted by the admin");
              return;
            }
          }}
          className="bg-indigo-500 hover:bg-indigo-600 text-white p-4 rounded-full shadow-2xl flex items-center justify-center group transition-all hover:scale-105 active:scale-95 border border-white/20"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </LightGlassBg>
  );
}
