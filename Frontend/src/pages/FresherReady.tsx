/* eslint-disable */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function FreshersReady() {
  const navigate = useNavigate();

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
    {
      key: "communication",
      label: "Communication",
      id: "communication",
    },
    {
      key: "aptitude",
      label: "Logical & Aptitude",
      id: "logical-aptitude",
    },
    {
      key: "technical",
      label: "Technical Skills",
      id: "technical-skills",
    },
  ];

  // Per-tab color settings (hex used for inline styles, tailwind-safe classes for fallbacks)
  const tabStyles: Record<
    string,
    { hex: string; tailwindBg: string; tailwindText: string }
  > = {
    communication: {
      hex: "#7B1FA2",
      tailwindBg: "bg-purple-700",
      tailwindText: "#DDA7FA",
    },
    technical: {
      hex: "#0B74DE",
      tailwindBg: "bg-blue-600",
      tailwindText: "#A7BFFA",
    },
    aptitude: {
      hex: "#16A34A",
      tailwindBg: "bg-green-600",
      tailwindText: "#ABFAA7",
    },
  };

  const [activeTab, setActiveTab] = useState<string>(tabs[0].key);
  const [items, setItems] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState<boolean>(false);
  const [itemsError, setItemsError] = useState<string | null>(null);
  const [trackDetails, setTrackDetails] = useState<any | null>(null);

  const defaultSlugs: Record<string, string> = {
    communication: "communication",
    aptitude: "logical-aptitude",
    technical: "technical-skills",
  };

  // Category-specific content
  const categoryContent: Record<
    string,
    { intro: string; tips: string[]; why: string; img: string }
  > = {
    communication: {
      intro:
        "Effective communication is the cornerstone of professional success. In today's workplace, the ability to articulate ideas clearly, listen actively, and adapt your message to different audiences is invaluable.",
      why: "Why Communication Skills Matter",
      tips: [
        "Practice active listening - Understanding others is as important as being understood",
        "Develop clarity in written communication - Emails and reports reflect your professionalism",
        "Master verbal articulation - Speak confidently in meetings and presentations",
        "Build emotional intelligence - Read the room and adapt your communication style",
        "Embrace feedback - Constructive criticism helps refine your communication approach",
      ],
      img: "images/abstract_communication_concept.png",
    },
    aptitude: {
      intro:
        "Logical reasoning and aptitude form the foundation of problem-solving in any profession. These skills help you analyze situations, make sound decisions, and approach challenges systematically.",
      why: "Why Logical & Aptitude Skills Matter",
      tips: [
        "Practice pattern recognition - Train your brain to identify trends and relationships",
        "Solve problems daily - Regular practice sharpens your analytical thinking",
        "Break complex problems into smaller parts - Divide and conquer for better solutions",
        "Time management - Learn to solve problems efficiently under pressure",
        "Learn from mistakes - Each error is an opportunity to strengthen your approach",
      ],
      img: "images/abstract_logic_and_aptitude_concept.png",
    },
    technical: {
      intro:
        "Technical skills are the practical knowledge and abilities required to perform specialized tasks. In the modern workplace, technical proficiency combined with problem-solving creates a powerful competitive advantage.",
      why: "Why Technical Skills Matter",
      tips: [
        "Stay current with industry trends - Technology evolves rapidly, keep learning",
        "Build hands-on experience - Theory is important, but practice makes perfect",
        "Master the fundamentals - Strong basics enable you to learn advanced concepts faster",
        "Develop debugging skills - Finding and fixing errors is as important as writing code",
        "Create personal projects - Practical application solidifies your knowledge",
      ],
      img: "images/abstract_technology_concept.png",
    },
  };

  const resolveSlugForTab = (tabKey: string) => {
    const found = tracks.find(
      (t) => t.slug === tabKey || t.slug === defaultSlugs[tabKey]
    );
    if (found) return found.slug;
    const byTitle = tracks.find((t) =>
      t.title.toLowerCase().includes(tabKey.split("-")[0])
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
        const [trackRes, testsRes] = await Promise.all([
          api.get<any>(`/api/assessments/tracks`),
          api.get<any[]>(`/api/assessments/tracks/${slug}/tests`),
        ]);
        if (!cancelled) {
          setTrackDetails(trackRes.data || null);
          setItems(testsRes.data || []);
        }
      } catch (err: any) {
        if (!cancelled) {
          setItems([]);
          setItemsError("Failed to load tests for this category");
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
      if (tab) {
        setActiveTab(tab.key);
      }
    }
  }, [tabs]);

  const content = categoryContent[activeTab];
  const activeStyle = tabStyles[activeTab] || tabStyles.communication;
  const activeHex = activeStyle.hex;
  const activeTailwindText = activeStyle.tailwindText;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div
        className="bg-cover bg-center"
        style={{ backgroundImage: `url(${content.img})` }}
      >
        <div className="py-16 md:py-32 bg-gradient-to-r from-black/60 via-black/0 to-black/0">
          <div className="mx-auto px-8">
            <div className="flex flex-col lg:justify-between gap-6">
              <div>
                <h1 className="text-4xl md:text-6xl md:max-w-4xl font-bold mb-3 tracking-tight text-white">
                  Fresher Readiness Program
                </h1>
                <p
                  className="text-lg md:text-xl text-gray-100/90 max-w-2xl"
                  style={{ color: `${activeTailwindText}dd` }}
                >
                  Master essential skills through comprehensive practice tests
                  and expert guidance
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className="px-4 py-2 rounded-full text-4xl font-bold"
                  style={{
                    backgroundColor: `${activeTailwindText}22`,
                    color: activeTailwindText,
                    border: `1px solid ${activeTailwindText}`,
                  }}
                >
                  {tabs.find((t) => t.key === activeTab)?.label}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Tabs */}
        <div className="mb-10">
          <div className="bg-white rounded-2xl shadow-lg p-2 inline-flex gap-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                id={t.id}
                onClick={() => setActiveTab(t.key)}
                style={
                  activeTab === t.key
                    ? { backgroundColor: tabStyles[t.key]?.hex ?? activeHex }
                    : undefined
                }
                className={`px-6 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                  activeTab === t.key
                    ? "text-white shadow"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* LEFT — CONTENT (2/5) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Intro Card */}
            {content && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
                <div className="p-6 border-b">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {content.why}
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    {content.intro}
                  </p>
                </div>

                <div className="p-6 space-y-4">
                  <h3 className="font-semibold text-gray-900">
                    Tips to Master
                  </h3>
                  {content.tips.map((tip, idx) => (
                    <div key={idx} className="flex gap-3">
                      <span
                        className="w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold"
                        style={{ backgroundColor: activeHex }}
                      >
                        {idx + 1}
                      </span>
                      <p className="text-gray-700 text-sm">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Track Details */}
            {trackDetails && trackDetails.content && (
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <h3 className="text-xl font-bold mb-3">{trackDetails.title}</h3>
                {trackDetails.description && (
                  <p className="text-gray-600 mb-4">
                    {trackDetails.description}
                  </p>
                )}
                <div
                  className="prose max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: trackDetails.content }}
                />
              </div>
            )}
          </div>

          {/* RIGHT — PRACTICE TESTS (3/5) */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Practice Tests
              </h2>
              <p className="text-gray-600">
                Test your skills with curated assessments
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6">
              {(loadingItems ? Array.from({ length: 4 }) : items).map(
                (it: any, idx: number) => (
                  <div
                    key={it?.testId ?? idx}
                    onClick={() =>
                      it?.testId &&
                      navigate(
                        `/freshers-pratice/test/${
                          it.trackSlug ?? resolveSlugForTab(activeTab)
                        }/${it.testId}`
                      )
                    }
                    className="cursor-pointer bg-white rounded-xl border border-gray-100 shadow hover:shadow-lg transition-all"
                  >
                    <div
                      className="h-1"
                      style={{ backgroundColor: activeHex }}
                    />
                    <div className="p-5">
                      <h3 className="font-bold text-gray-900 mb-2">
                        {it?.title ?? (
                          <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse" />
                        )}
                      </h3>

                      {it && (
                        <>
                          <p className="text-sm text-gray-600 mb-3">
                            {it.questionsCount ?? it.questions?.length ?? "—"}{" "}
                            questions
                          </p>

                          <span
                            className="font-semibold text-sm"
                            style={{ color: activeHex }}
                          >
                            Start Test →
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>

            {!loadingItems && items.length === 0 && !itemsError && (
              <div className="text-center py-16 bg-white rounded-xl shadow">
                <p className="text-gray-600">
                  No tests available for this category.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
