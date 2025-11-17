/* eslint-disable */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function FreshersReady() {
  const navigate = useNavigate();

  const [tracks, setTracks] = useState<Array<{ title: string; description: string; slug: string }>>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get<Array<{ title: string; description: string; slug: string }>>(`/api/assessments/tracks`);
        if (!cancelled) setTracks(res.data || []);
      } catch (err) {
        if (!cancelled) console.error('Failed to load tracks', err);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const tabs = [
    { key: 'communication', label: 'Communication' },
    { key: 'aptitude', label: 'Logical & Aptitude' },
    { key: 'technical', label: 'Technical Skills' },
  ];

  const [activeTab, setActiveTab] = useState<string>(tabs[0].key);
  const [items, setItems] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState<boolean>(false);
  const [itemsError, setItemsError] = useState<string | null>(null);
  const [trackDetails, setTrackDetails] = useState<any | null>(null);

  const defaultSlugs: Record<string, string> = {
    communication: 'communication',
    aptitude: 'logical-aptitude',
    technical: 'technical-skills',
  };

  // Category-specific content
  const categoryContent: Record<string, { intro: string; tips: string[]; why: string }> = {
    communication: {
      intro: "Effective communication is the cornerstone of professional success. In today's workplace, the ability to articulate ideas clearly, listen actively, and adapt your message to different audiences is invaluable.",
      why: "Why Communication Skills Matter",
      tips: [
        "Practice active listening - Understanding others is as important as being understood",
        "Develop clarity in written communication - Emails and reports reflect your professionalism",
        "Master verbal articulation - Speak confidently in meetings and presentations",
        "Build emotional intelligence - Read the room and adapt your communication style",
        "Embrace feedback - Constructive criticism helps refine your communication approach"
      ]
    },
    aptitude: {
      intro: "Logical reasoning and aptitude form the foundation of problem-solving in any profession. These skills help you analyze situations, make sound decisions, and approach challenges systematically.",
      why: "Why Logical & Aptitude Skills Matter",
      tips: [
        "Practice pattern recognition - Train your brain to identify trends and relationships",
        "Solve problems daily - Regular practice sharpens your analytical thinking",
        "Break complex problems into smaller parts - Divide and conquer for better solutions",
        "Time management - Learn to solve problems efficiently under pressure",
        "Learn from mistakes - Each error is an opportunity to strengthen your approach"
      ]
    },
    technical: {
      intro: "Technical skills are the practical knowledge and abilities required to perform specialized tasks. In the modern workplace, technical proficiency combined with problem-solving creates a powerful competitive advantage.",
      why: "Why Technical Skills Matter",
      tips: [
        "Stay current with industry trends - Technology evolves rapidly, keep learning",
        "Build hands-on experience - Theory is important, but practice makes perfect",
        "Master the fundamentals - Strong basics enable you to learn advanced concepts faster",
        "Develop debugging skills - Finding and fixing errors is as important as writing code",
        "Create personal projects - Practical application solidifies your knowledge"
      ]
    }
  };

  const resolveSlugForTab = (tabKey: string) => {
    const found = tracks.find(t => t.slug === tabKey || t.slug === defaultSlugs[tabKey]);
    if (found) return found.slug;
    const byTitle = tracks.find(t => t.title.toLowerCase().includes(tabKey.split('-')[0]));
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
          setItemsError('Failed to load tests for this category');
        }
      } finally {
        if (!cancelled) setLoadingItems(false);
      }
    })();
    return () => { cancelled = true; };
  }, [activeTab, tracks]);

  const content = categoryContent[activeTab];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#fff6f6] to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#C21817] to-[#A51515] text-white">
        <div className="max-w-6xl mx-auto px-8 py-16">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4 tracking-tight">Fresher Readiness Program</h1>
            <p className="text-xl text-red-50 max-w-2xl mx-auto">
              Master essential skills through comprehensive practice tests and expert guidance
            </p>
          </div>
        </div>
      </div>

  <div className="max-w-6xl mx-auto px-8 py-12">
        {/* Tab Navigation */}
        <div className="mb-12">
          <div className="bg-white rounded-2xl shadow-xl p-2 flex flex-col md:flex-row md:inline-flex gap-2">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${activeTab === t.key
                    ? 'bg-gradient-to-r from-[#C21817] to-[#A51515] text-white shadow-lg shadow-red-200 scale-105'
                    : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {itemsError && (
          <div className="mb-6 bg-red-50 border-l-4 border-[#C21817] p-4 rounded-lg">
            <p className="text-red-800 font-medium">{itemsError}</p>
          </div>
        )}

        {/* Category Introduction */}
        {content && (
          <div className="mb-12 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-red-50 to-white p-8 border-b border-red-100">
              <div className="flex items-start gap-4">
                <div className="w-2 h-16 bg-gradient-to-b from-[#C21817] to-red-400 rounded-full"></div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">{content.why}</h2>
                  <p className="text-lg text-gray-700 leading-relaxed">{content.intro}</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-[#C21817] text-white rounded-lg flex items-center justify-center text-sm">✓</span>
                Tips to Master This Skill
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {content.tips.map((tip, idx) => (
                  <div key={idx} className="flex gap-3 items-start group">
                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-[#C21817] transition-colors">
                      <span className="text-[#C21817] text-xs font-bold group-hover:text-white">{idx + 1}</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Track Details from API */}
        {trackDetails && trackDetails.content && (
          <div className="mb-12 bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{trackDetails.title}</h2>
            {trackDetails.description && (
              <p className="text-gray-600 mb-6 text-lg">{trackDetails.description}</p>
            )}
            <div className="prose max-w-none text-gray-700 border-t border-gray-100 pt-6"
              dangerouslySetInnerHTML={{ __html: trackDetails.content }} />
          </div>
        )}

        {/* Practice Tests Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-12 bg-gradient-to-r from-[#C21817] to-red-400 rounded-full"></div>
            <h2 className="text-3xl font-bold text-gray-900">Practice Tests</h2>
          </div>
          <p className="text-gray-600 text-lg mb-8">
            Challenge yourself with our curated practice tests designed to help you excel
          </p>
        </div>

        {/* Test Cards Grid */}
  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(loadingItems ? Array.from({ length: 6 }) : items).map((it: any, idx: number) => (
            <div
              key={it?.testId ?? idx}
              onClick={() => it?.testId && navigate(`/freshers-pratice/test/${it.trackSlug ?? resolveSlugForTab(activeTab)}/${it.testId}`)}
              className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer transform hover:-translate-y-1"
            >
              <div className="h-2 bg-gradient-to-r from-[#C21817] to-red-400"></div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#C21817] transition-colors leading-tight">
                    {it?.title ?? (
                      <span className="block h-6 bg-gray-200 rounded animate-pulse w-3/4"></span>
                    )}
                  </h3>
                </div>

                {it ? (
                  <>
                    <div className="flex items-center gap-3 text-sm text-gray-600 mb-4">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-[#C21817] rounded-full"></span>
                        {it.type || 'Practice'}
                      </span>
                      <span>•</span>
                      <span>{typeof it?.questionsCount === 'number' ? it.questionsCount : (Array.isArray(it?.questions) ? it.questions.length : '—')} questions</span>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <span className="text-xs bg-red-50 text-[#A51515] px-3 py-1.5 rounded-full font-medium border border-red-100">
                        ⏱ Timed
                      </span>
                      <span className="text-xs bg-gray-50 text-gray-700 px-3 py-1.5 rounded-full font-medium border border-gray-200">
                        📝 Practice Mode
                      </span>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <span className="text-[#C21817] text-sm font-semibold group-hover:gap-2 flex items-center gap-1 transition-all">
                        Start Test
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                    <div className="h-8 bg-gray-200 rounded animate-pulse w-full"></div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {!loadingItems && items.length === 0 && !itemsError && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-xl">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📝</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Tests Available</h3>
            <p className="text-gray-600">Check back soon for new practice tests in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}