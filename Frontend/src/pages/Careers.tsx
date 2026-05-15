import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Target, Compass, Play } from "lucide-react";
import { DarkGradientBg } from "@/components/ui/elegant-dark-pattern";
import { GlowCard } from "@/components/ui/spotlight-card";
import { PageHero } from "@/components/ui/page-hero";

const videos = [
  { id: "eV0m6NowqWA", title: "From Confusion to Dream Job" },
  { id: "Lv1ABw3RPwc", title: "How Freshers Crack Top Companies" },
  { id: "w6C_ABHXMZU", title: "No Clarity? This Will Change You" },
];

const DreamJobPage = () => {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  return (
    <DarkGradientBg className="text-[#e5e1e4]">
      <div className="max-w-[1440px] mx-auto px-6 py-8">
        <PageHero
          label="CAREER_GUIDANCE"
          title={<>Your Dream Job<br /><span className="bg-linear-to-r from-[#c0c1ff] to-[#4edea3] bg-clip-text text-transparent">Is Still Possible</span></>}
          subtitle="Whether you are confused, unplaced, or unsure about your future — you are not late. You just need direction."
        >
          <div className="flex gap-4 flex-wrap mt-4">
            {[
              { icon: <Compass className="w-5 h-5 text-[#c0c1ff]" />, label: "No Clarity" },
              { icon: <Target className="w-5 h-5 text-[#4edea3]" />, label: "Dream Companies" },
              { icon: <Sparkles className="w-5 h-5 text-[#fbbf24]" />, label: "Step-by-Step Path" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/[0.08] px-5 py-3 rounded-xl">
                {item.icon}
                <span className="text-zinc-200 font-dmsans text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        </PageHero>
      </div>

      {/* Message Cards */}
      <section className="max-w-5xl mx-auto px-6 pb-20 grid md:grid-cols-3 gap-6">
        {[
          { title: "No Clarity is Normal", desc: "Most students feel lost. Clarity comes from action, not thinking." },
          { title: "College Doesn't Decide Worth", desc: "Tier-3, no referrals — still thousands crack dream jobs yearly." },
          { title: "Consistency Beats Talent", desc: "Daily effort matters more than intelligence or luck." },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <GlowCard glowColor="purple" customSize className="!aspect-auto !p-0">
              <div className="p-6 z-10 relative">
                <h3 className="font-satoshi text-xl font-bold text-zinc-100 mb-2">{item.title}</h3>
                <p className="text-zinc-500 font-dmsans text-sm leading-relaxed">{item.desc}</p>
              </div>
            </GlowCard>
          </motion.div>
        ))}
      </section>

      {/* Videos */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="font-jetbrains text-xs text-[#c0c1ff] uppercase tracking-[0.2em] mb-2 block">WATCH_AND_LEARN</span>
            <h2 className="font-satoshi text-3xl md:text-4xl font-bold text-white">Watch. Feel. Transform.</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {videos.map((video) => (
              <motion.div
                key={video.id}
                whileHover={{ scale: 1.03 }}
                onClick={() => setActiveVideo(video.id)}
                className="relative rounded-xl overflow-hidden cursor-pointer group border border-white/[0.08]"
              >
                <img
                  src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                  alt={video.title}
                  className="w-full h-56 object-cover"
                />
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Play className="w-14 h-14 text-white group-hover:scale-110 transition" />
                </div>
                <div className="absolute bottom-0 w-full bg-linear-to-t from-black/80 to-transparent p-4">
                  <p className="font-satoshi font-semibold text-white">{video.title}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Modal */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-[999] flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-4xl aspect-video">
              <button onClick={() => setActiveVideo(null)} className="absolute -top-10 right-0 text-white">
                <X size={30} />
              </button>
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1`}
                allow="autoplay; encrypted-media"
                allowFullScreen
                className="w-full h-full rounded-xl"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </DarkGradientBg>
  );
};

export default DreamJobPage;
