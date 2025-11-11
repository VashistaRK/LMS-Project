import { useRef } from "react";
//import BusinessPage, { BusinessPageMobile } from "./BusinessPage";
import { motion, useScroll, useTransform } from "framer-motion";
import { ParallaxProvider } from "react-scroll-parallax";
import ArchSection from "./ArchSection";
// import ParallaxBusiness from "./ParllexSection";
import {
  ChevronLeft,
  ChevronRight,
  Cloud,
  Code,
  Database,
  ShieldCheck,
} from "lucide-react";
import CareerPreparation from "@/components/Page";

const categories = [
  {
    icon: <Database className="text-[#B00000] text-2xl" />,
    title: "AI + Data",
    desc: "Work smarter (and harder) with artificial intelligence and keep up with Cloud + Data trends.",
    extra: "Explore machine learning, data engineering, and AI-driven analytics to transform raw data into actionable insights.",
  },
  {
    icon: <Code className="text-[#B00000] text-2xl" />,
    title: "Software dev",
    desc: "Build fluency in languages like C#, Java, Angular, and JavaScript and learn to develop efficiently.",
    extra: "Master modern frameworks, agile methodologies, and DevOps practices to deliver scalable, maintainable software.",
  },
  {
    icon: <Cloud className="text-[#B00000] text-2xl" />,
    title: "Cloud + IT Ops",
    desc: "From AWS to Google Cloud and everything in between, expand your cloud expertise.",
    extra: "Gain hands-on experience with cloud infrastructure, container orchestration, and continuous integration pipelines.",
  },
  {
    icon: <ShieldCheck className="text-[#B00000] text-2xl" />,
    title: "Security",
    desc: "Stop cyber attacks in their tracks and secure critical skills to keep data safe.",
    extra: "Learn threat modeling, penetration testing, and compliance standards to protect digital assets effectively.",
  },
];

const experts = [
  {
    name: "Chris Jackson",
    title: "Cybersecurity expert",
    img: "images/Applied Arts and Sciences.jpg",
  },
  {
    name: "Ben Howard",
    title: "BI & Data Specialist",
    img: "images/Business Administration (iMBA).jpg",
  },
  {
    name: "Sarah Holderness",
    title: "Software development",
    img: "images/Computer Science in Data Science.jpg",
  },
];

export default function LandingPage() {
  //const [isMobile, setIsMobile] = useState(false);
  const scaleSectionRef = useRef<HTMLDivElement>(null);
  const videoScrollerRef = useRef<HTMLDivElement>(null);


  const scroll = (direction: "left" | "right") => {
    const el = videoScrollerRef.current;
    if (!el) return;
    const scrollAmount = direction === "left" ? -420 : 420;
    el.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const videos = [
    "https://www.youtube.com/embed/eV0m6NowqWA?si=Nz_Nw6-orR3H3raK",
    "https://www.youtube.com/embed/Lv1ABw3RPwc?si=PHJd53FTA73ssqdx",
    "https://www.youtube.com/embed/w6C_ABHXMZU?si=YAEpmOZCDcoE5SVd",
  ];


  // Use the scale section as the scroll container for better control
  const { scrollYProgress } = useScroll({
    target: scaleSectionRef,
    offset: ["start end", "end start"],
  });

  // Adjusted scale values for smoother, more noticeable effect
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.7, 1, 1.1]);
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.3, 0.7, 1],
    [0.3, 1, 1, 0.8]
  );

 // useEffect(() => {
    // Better mobile detection with resize handling
    //const checkMobile = () => {
    //  setIsMobile(window.innerWidth < 1200);
    //};

    //checkMobile();
    //window.addEventListener("resize", checkMobile);

    //return () => window.removeEventListener("resize", checkMobile);
  //}, []);

  const getCategoryExtraContent = (title: string) => {
    switch (title) {
      case "AI + Data":
        return "Explore machine learning, data engineering, and AI-driven analytics to transform raw data into actionable insights.";
      case "Software dev":
        return "Master modern frameworks, agile methodologies, and DevOps practices to deliver scalable, maintainable software.";
      case "Cloud + IT Ops":
        return "Gain hands-on experience with cloud infrastructure, container orchestration, and continuous integration pipelines.";
      case "Security":
        return "Learn threat modeling, penetration testing, and compliance standards to protect digital assets effectively.";
      default:
        return "";
    }
  };

  return (
    <ParallaxProvider>
      <div className="text-gray-800 flex flex-col items-center font-Quick overflow-hidden">
        {/* Hero Section */}
        <section className="relative w-full min-h-screen overflow-hidden flex items-start justify-center">
          <video
            className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
            src="videos/bgg.mp4"
            autoPlay
            loop
            muted
            playsInline
          />
        </section>

        {/* Scroll-linked Hero Text with Scale Effect */}
        <motion.section
          ref={scaleSectionRef}
          className="w-full flex items-center justify-center sm:px-8 pt-20 sm:py-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1 }}
        >
          <motion.div style={{ scale, opacity }} className="relative bg-red-700 text-white w-full">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl text-center font-semibold leading-relaxed">
              A complete LMS to take you from beginner to job‑ready
            </h2>

            {/* Optional: Add a subtle background glow effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-[#B00000]/10 blur-3xl -z-10"
              style={{
                opacity: useTransform(scrollYProgress, [0.3, 0.7], [0, 0.5]),
              }}
            />
          </motion.div>
        </motion.section>

        <section className="py-16 text-white w-full">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {categories.map((c) => (
                <motion.div
                  key={c.title}
                  whileHover={{ scale: 1.05 }}
                  className="bg-red-50 p-8 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 cursor-pointer group"
                >
                  <div className="mb-6 text-[#B00000]">{c.icon}</div>
                  <h3 className="text-2xl text-[#B00000] font-bold mb-3">{c.title}</h3>
                  <p className="text-black text-base leading-relaxed">
                    {c.desc} {getCategoryExtraContent(c.title)}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Architecture Section */}
        <section className="w-full">
          <ArchSection />
        </section>
        {/* <ParallaxBusiness /> */}
        <CareerPreparation/>
        <section className="w-full min-h-screen bg-gradient-to-br from-[#1B1B1B] via-[#2D2D2D] to-[#1B1B1B] flex items-center justify-center px-4 sm:px-8">
          <div className="relative flex flex-col sm:flex-row text-white justify-between items-center backdrop-blur-lg bg-[#FFFFFF]/10 rounded-3xl p-8 sm:p-16 shadow-lg max-w-7xl md:min-w-7xl border border-[#E5E5E5]/30">

            {/* Left Text Section */}
            <motion.aside
              initial={{ opacity: 0, x: -200 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 2 }}
              className="flex flex-col font-extrabold max-w-xl items-start sm:py-8"
            >
              <h4 className="text-[#FF2E2E] text-xl tracking-wide">
                Outcome-driven learning for real careers
              </h4>

              <h2 className="text-2xl sm:text-3xl sm:mb-4 sm:max-w-xl text-start font-extrabold leading-relaxed text-white">
                Join now and transform your future in technology
              </h2>

              <p className="text-lg font-semibold max-w-lg text-start text-[#E5E5E5]">
                Master in-demand skills with guided paths, hands-on labs, mock interviews, and career services.
                Our LMS blends expert-led content with projects and assessments so you build a portfolio employers trust
                and the confidence to crack interviews.
              </p>

              {/* Buttons */}
              <nav className="mt-6 flex gap-4">
                <button className="p-2 md:p-3 rounded-full text-xs sm:text-sm bg-[#E10600] text-white hover:bg-[#B00000] hover:scale-110 hover:shadow-[0_0_15px_#FF2E2E] transition-all duration-300">
                  Explore courses
                </button>
                <button className="p-2 sm:p-3 border border-[#E10600] rounded-full text-xs sm:text-sm bg-white text-[#1B1B1B] font-semibold hover:bg-[#E10600] hover:text-white hover:scale-110 transition-all duration-300">
                  Start learning now
                </button>
              </nav>
            </motion.aside>

            {/* Right Image Section */}
            <motion.img
              initial={{ opacity: 0, x: 200 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 2 }}
              src="images/Gemini.png"
              alt="Gemini"
              className="mt-8 sm:mt-0 sm:h-80 rounded-2xl shadow-lg border border-[#E5E5E5]/30"
            />
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-7xl flex flex-col space-y-10 mx-auto px-6 items-center">
            <aside className="w-full my-3 flex items-center justify-center">
              <p className="font-bold text-center text-sm rounded-full p-1 bg-amber-100">
                👍🏻Best of All👇🏻
              </p>
            </aside>
            <h2 className="text-4xl font-bold text-center">
              Future‑proof your skills with guided, practical learning
            </h2>
            <p className="max-w-2xl text-center mb-12">
              Structured paths, expert mentorship, and hands‑on projects help you
              move from theory to real‑world application—so you can showcase
              job‑ready skills and stand out in interviews.
            </p>
            <motion.div
              initial={{ opacity: 0, y: 200 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {experts.map((ex) => (
                <div
                  key={ex.name}
                  className="rounded-lg overflow-hidden shadow hover:shadow-lg"
                >
                  <img
                    src={ex.img}
                    alt={ex.name}
                    className="h-82 w-full object-cover object-center bg-gray-400"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold">{ex.name}</h3>
                    <p className="text-sm text-gray-600">{ex.title}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>
        {/* Career Guidance (condensed content + horizontal video carousel) */}
        <section className="bg-gray-900 py-16 w-full text-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-bold mb-3">Career guidance that actually helps</h2>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Short, practical guidance paired with curated videos to help you make confident, job‑ready decisions.
              </p>
            </div>
            <div className="relative w-full max-w-7xl mx-auto py-8">
              {/* Left Button */}
              <button
                onClick={() => scroll("left")}
                className="absolute -left-18 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white text-3xl font-bold rounded-full w-14 h-14 flex items-center justify-center backdrop-blur-md shadow-md transition-all duration-300"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>

              {/* Scrollable Row */}
              <div
                ref={videoScrollerRef}
                className="flex gap-6 overflow-x-auto scroll-smooth px-4 scrollbar-hide"
              >
                {videos.map((src, i) => (
                  <div
                    key={i}
                    className="min-w-[320px] sm:min-w-[420px] aspect-video bg-black/30 rounded-2xl overflow-hidden border border-white/10 shadow-lg flex-shrink-0"
                  >
                    <iframe
                      className="w-full h-full"
                      src={src}
                      title={`career-video-${i}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                ))}
              </div>

              {/* Right Button */}
              <button
                onClick={() => scroll("right")}
                className="absolute -right-18 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white text-3xl font-bold rounded-full w-14 h-14 flex items-center justify-center backdrop-blur-md shadow-md transition-all duration-300"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </div>
            <div className="flex items-center justify-center">
              <a href="/carrer-guidence" className="rounded-xl p-4 bg-red-700 text-xl text-white">View All Content</a>
            </div>
          </div>
        </section>
      </div>
    </ParallaxProvider>
  );
}
