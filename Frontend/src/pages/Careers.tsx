import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Target, Compass, Play } from "lucide-react";

const videos = [
  {
    id: "eV0m6NowqWA",
    title: "From Confusion to Dream Job",
  },
  {
    id: "Lv1ABw3RPwc",
    title: "How Freshers Crack Top Companies",
  },
  {
    id: "w6C_ABHXMZU",
    title: "No Clarity? This Will Change You",
  },
];

const DreamJobPage = () => {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  return (
    <div className="min-h-screen font-Quick">
      {/* HERO */}
      <section className="text-center px-6 pt-18 pb-20">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight"
        >
          Your Dream Job <br />
          <span className="">Is Still Possible</span>
        </motion.h1>

        <p className="mt-6 max-w-3xl mx-auto text-gray-600 text-lg">
          Whether you are confused, unplaced, or unsure about your future —
          <strong> you are not late</strong>. You just need direction.
        </p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-10 flex justify-center gap-6 flex-wrap"
        >
          <div className="flex items-center gap-3 bg-white shadow-lg px-6 py-4 rounded-xl">
            <Compass className="text-blue-500" />
            <span>No Clarity</span>
          </div>
          <div className="flex items-center gap-3 bg-white shadow-lg px-6 py-4 rounded-xl">
            <Target className="text-purple-500" />
            <span>Dream Companies</span>
          </div>
          <div className="flex items-center gap-3 bg-white shadow-lg px-6 py-4 rounded-xl">
            <Sparkles className="text-indigo-500" />
            <span>Step-by-Step Path</span>
          </div>
        </motion.div>
      </section>

      {/* MESSAGE */}
      <section className="max-w-6xl mx-auto px-6 pb-20 grid md:grid-cols-3 gap-8">
        {[
          {
            title: "No Clarity is Normal",
            desc: "Most students feel lost. Clarity comes from action, not thinking.",
          },
          {
            title: "College Doesn’t Decide Your Worth",
            desc: "Tier-3, no referrals — still thousands crack dream jobs yearly.",
          },
          {
            title: "Consistency Beats Talent",
            desc: "Daily effort matters more than intelligence or luck.",
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-xl p-6 hover:scale-[1.03] transition"
          >
            <h3 className="text-xl font-bold mb-2">{item.title}</h3>
            <p className="text-gray-600">{item.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* VIDEO SECTION */}
      <section className="bg-gray-950 text-white py-20 px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Watch. Feel. Transform.
        </h2>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {videos.map((video) => (
            <motion.div
              key={video.id}
              whileHover={{ scale: 1.05 }}
              onClick={() => setActiveVideo(video.id)}
              className="relative rounded-2xl overflow-hidden shadow-xl cursor-pointer group"
            >
              <img
                src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                alt={video.title}
                className="w-full h-56 object-cover"
              />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Play className="w-14 h-14 text-white group-hover:scale-110 transition" />
              </div>
              <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4">
                <p className="font-semibold">{video.title}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* VIDEO MODAL */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-[999] flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-4xl aspect-video">
              <button
                onClick={() => setActiveVideo(null)}
                className="absolute -top-10 right-0 text-white"
              >
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
    </div>
  );
};

export default DreamJobPage;
