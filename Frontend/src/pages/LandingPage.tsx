import {
  ArrowDownRight,
  ArrowRightIcon,
  ArrowUpRight,
  Atom,
  Book,
  Check,
  Clock,
  ListCheck,
  MessageSquareDot,
  Rocket,
  ScanFace,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import TestimonialSlider from "../components/ui/testimonial-slider";
import { DarkGradientBg } from "@/components/ui/elegant-dark-pattern";

const growthData = [
  { label: "Start", value: 20 },
  { label: "Learn", value: 30 },
  { label: "Struggle", value: 40 },
  { label: "Learn More", value: 50 },
  { label: "Build", value: 65 },
  { label: "Test", value: 80 },
  { label: "Intern", value: 120 },
  { label: "Initial Job", value: 160 },
  { label: "Dream Job", value: 200 },
];

const avatars = [
  { index: 1, img: "/assets/Business Administration (iMBA).jpg" },
  { index: 3, img: "/assets/Computer Science in Data Science.jpg" },
  { index: 7, img: "/assets/yash.jpg" },
];

const LandingPage = () => {
  const videos = [
    "https://www.youtube.com/embed/eV0m6NowqWA?si=Nz_Nw6-orR3H3raK",
    "https://www.youtube.com/embed/Lv1ABw3RPwc?si=PHJd53FTA73ssqdx",
    "https://www.youtube.com/embed/w6C_ABHXMZU?si=YAEpmOZCDcoE5SVd",
  ];
  return (
    <DarkGradientBg className="text-[#e5e1e4]">
    {/* HERO — full bleed */}
    <section className="relative z-10 w-full min-h-[calc(100vh-80px)] flex items-center px-6 md:px-12 xl:px-20 py-12 md:py-16 overflow-hidden">
      {/* Cyan corner glow — hero-local */}
      <div className="absolute -top-[300px] -left-[300px] w-[800px] h-[800px] bg-[#00cfff] opacity-40 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 right-[-200px] -translate-y-1/2 w-[600px] h-[600px] bg-[#c0c1ff] opacity-25 blur-[140px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-10 items-center">
          {/* LEFT — content */}
          <div className="flex flex-col gap-7 md:gap-9 min-w-0">
            <div className="inline-flex items-center gap-2 text-[#c0c1ff] font-jetbrains text-[11px] tracking-[0.2em] uppercase border-b border-[#c0c1ff]/30 pb-1 w-fit">
              <span>CAREER_MASTERY_PLATFORM</span>
              <span>↗</span>
            </div>

            <h1 className="text-[44px] sm:text-[56px] md:text-[68px] xl:text-[80px] leading-[1] tracking-[-0.04em] font-extrabold text-white">
              Career Mastery.<br />
              <span className="bg-gradient-to-r from-[#e1dfff] to-[#4edea3] bg-clip-text text-transparent">
                Starts Here.
              </span>
            </h1>

            <p className="text-lg md:text-xl xl:text-2xl font-bold text-zinc-400 max-w-2xl leading-snug tracking-[-0.02em]">
              Bridging the gap between academic theory and corporate reality. Master the engineering skills demanded by top-tier firms.
            </p>

            <div className="border-l-2 border-[#c0c1ff]/30 pl-6 py-1">
              <p className="font-jetbrains text-[12px] md:text-[13px] uppercase tracking-wider text-zinc-300">
                PRACTICE WITH REAL PAPERS. CRACK REAL INTERVIEWS.
              </p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-x-6 md:gap-x-8 gap-y-5">
              {[
                { value: "50+", label: "Companies" },
                { value: "200+", label: "Papers" },
                { value: "94%", label: "Success" },
                { value: "5+", label: "Years" },
              ].map((s, i, arr) => (
                <div key={s.label} className="flex items-center gap-6 md:gap-8">
                  <div className="flex flex-col">
                    <span className="text-2xl md:text-[32px] font-bold text-white leading-none">{s.value}</span>
                    <span className="font-jetbrains text-[10px] text-zinc-500 uppercase tracking-widest mt-2">{s.label}</span>
                  </div>
                  {i < arr.length - 1 && <div className="h-10 w-px bg-white/10" />}
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link to="/Authenticate">
                <button className="bg-[#c0c1ff] text-black px-8 py-4 font-jetbrains font-bold tracking-widest text-[13px] hover:shadow-[0_0_30px_rgba(0,207,255,0.6)] transition-all flex items-center gap-3 uppercase">
                  Start Learning
                  <ArrowRightIcon className="w-5 h-5" />
                </button>
              </Link>
              <button className="border border-white/20 px-8 py-4 font-jetbrains font-bold tracking-widest text-[13px] text-white hover:bg-white/5 transition-all uppercase">
                View Demo
              </button>
            </div>
          </div>

          {/* RIGHT — 3D render */}
          <div className="relative w-full max-w-[640px] mx-auto lg:mx-0 lg:justify-self-end">
            <div className="absolute inset-0 bg-gradient-radial from-[#c0c1ff]/25 via-[#00cfff]/10 to-transparent blur-3xl scale-110" />
            <img
              src="/assets/hero-3d-render.png"
              alt="FresherReady 3D isometric"
              className="relative w-full h-auto object-contain drop-shadow-[0_0_60px_rgba(0,207,255,0.3)]"
            />
          </div>
        </div>
      </section>

    {/* Below-hero content constrained */}
    <div className="relative z-10 leading-tighter tracking-tighter max-w-7xl mx-4 xl:mx-auto">
      <section className="w-full py-20">
        <div className="mx-auto max-w-7xl space-y-12 md:space-y-24">
          <h2 className="text-xl font-mulish font-bold text-white mb-4">
            What You’ll Learn Here
          </h2>

          <div className="max-w-2xl text-sm sm:text-base font-semibold leading-relaxed text-zinc-400">
            <p>
              You will develop strong aptitude and logical reasoning skills,
              sharpen your problem-solving mindset, and build the analytical
              thinking required for real-world technical and business
              challenges.
            </p>
            <p className="pt-3">
              The platform also focuses on IT fundamentals, hands-on technical
              training, and communication skills — helping you gain clarity,
              confidence, and job-ready expertise aligned with industry
              expectations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <h1 className="max-w-md text-3xl md:text-4xl font-extrabold font-mulish text-white mb-4">
                AI-Powered Communication Mastery
              </h1>

              <p className="max-w-md text-lg text-zinc-300 font-semibold">
                Develop executive presence, public speaking, and professional
                business writing with AI-driven coaching.
              </p>

              <ul className="mt-4 space-y-2">
                <li className="flex items-center gap-2 justify-center md:justify-start">
                  <Check className="text-[#4edea3]" /> Real-time feedback
                </li>
                <li className="flex items-center gap-2 justify-center md:justify-start">
                  <Check className="text-[#4edea3]" /> Scenario-based practice
                </li>
              </ul>

              <a href="/freshers-pratice#communications" className="mt-6">
                <button className="px-6 py-3 bg-[#c0c1ff] text-black font-jetbrains text-xs font-bold tracking-widest uppercase hover:shadow-[0_0_24px_rgba(0,207,255,0.5)] transition-all">
                  Start Practicing
                </button>
              </a>
            </div>

            <img
              src="/assets/abstract_communication_concept.png"
              alt="com"
              className="w-full mx-auto rounded-xl"
            />
            <img
              src="/assets/abstract_logic_and_aptitude_concept.png"
              alt="com"
              className="hidden md:flex w-full mx-auto rounded-xl"
            />

            <div className="flex flex-col items-center md:items-end text-center md:text-left">
              <h1 className="max-w-md text-3xl md:text-4xl font-extrabold font-mulish text-white mb-4">
                Aptitude & Logical
              </h1>

              <p className="max-w-md md:text-end text-lg text-zinc-300 font-semibold">
                Build strong logical reasoning and quantitative aptitude with
                guided practice, and speed-focused drills.
              </p>

              <ul className="mt-4 space-y-2">
                <li className="flex items-center gap-2 justify-center md:justify-end">
                  <Check className="text-[#4edea3]" /> Speed math tricks
                </li>
                <li className="flex items-center gap-2 justify-center md:justify-end">
                  <Check className="text-[#4edea3]" /> Real interview-level
                  questions
                </li>
              </ul>

              <a href="/freshers-pratice#logical-aptitude" className="mt-6">
                <button className="px-6 py-3 bg-[#c0c1ff] text-black font-jetbrains text-xs font-bold tracking-widest uppercase hover:shadow-[0_0_24px_rgba(0,207,255,0.5)] transition-all">
                  Start Practicing
                </button>
              </a>
            </div>

            <img
              src="/assets/abstract_logic_and_aptitude_concept.png"
              alt="com"
              className="flex md:hidden w-full mx-auto rounded-xl"
            />

            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <h1 className="max-w-md text-3xl md:text-4xl font-extrabold font-mulish text-white mb-4">
                Tech Track
              </h1>

              <p className="max-w-md text-lg text-zinc-300 font-semibold">
                Go beyond theory. Learn by building real systems, writing real
                code, and solving real industry problems.
              </p>

              <ul className="mt-4 space-y-2">
                <li className="flex items-center gap-2 justify-center md:justify-start">
                  <Check className="text-[#4edea3]" /> Hands-on coding practice
                </li>
                <li className="flex items-center gap-2 justify-center md:justify-start">
                  <Check className="text-[#4edea3]" /> Industry-aligned learning
                </li>
              </ul>

              <a href="/freshers-pratice#technical-skills" className="mt-6">
                <button className="px-6 py-3 bg-[#c0c1ff] text-black font-jetbrains text-xs font-bold tracking-widest uppercase hover:shadow-[0_0_24px_rgba(0,207,255,0.5)] transition-all">
                  Start Practicing
                </button>
              </a>
            </div>

            <img
              src="/assets/abstract_technology_concept.png"
              alt="com"
              className="w-full mx-auto rounded-xl"
            />
          </div>
        </div>
      </section>
      <section className="w-full py-12">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-xl font-mulish font-bold text-white mb-4">
            Mastery Through Self-Learning
          </h2>

          <div className="max-w-2xl text-sm sm:text-base font-semibold leading-relaxed text-zinc-400">
            <p>
              Our platform is built on the principle that the deepest learning
              happens when you are in the driver’s seat. We provide the map; you
              choose the speed and the destination.
            </p>
            <p className="pt-3">
              With a wealth of resources and guidance, you have the freedom and
              flexibility to shape your personal and professional growth on your
              own terms.
            </p>
          </div>

          <div className="relative min-h-screen w-full mt-10 overflow-hidden rounded-2xl flex items-center justify-center">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
              <img
                src="/assets/group_of_diverse_students.png"
                alt="Background"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Dark Blue Overlay */}
            <div className="absolute inset-0 z-1 bg-gradient-to-br from-blue-950/70 via-slate-900/70 to-black/70" />

            {/* Centered Content */}
            <div className="relative z-10 max-w-4xl text-start md:text-center px-6">
              <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
                Turning Your Degree Into <br />
                <span className="text-blue-400">A Successful Career</span>
              </h2>

              <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                We bridge the gap between academics and industry by blending
                real-world engineering skills, system thinking, and modern
                DevOps practices.
              </p>
              <div className="grid gap-8 text-started mt-12 md:grid-cols-2">
                <div className="flex gap-5">
                  <div className="mt-1 flex-shrink-0 w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                    <Target className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-3 text-white">
                      Our Vision
                    </h3>
                    <p className="text-slate-400 leading-relaxed">
                      To ensure every degree student graduates with more than
                      just a certificate. We envision a world where academic
                      foundations are seamlessly fused with industry-ready
                      skills.
                    </p>
                  </div>
                </div>
                <div className="flex gap-5">
                  <div className="mt-1 flex-shrink-0 w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                    <Rocket className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-3 text-white">
                      Our Mission
                    </h3>
                    <p className="text-slate-400 leading-relaxed">
                      To bridge the gap between campus and corporate by
                      providing a holistic learning path. We integrate practical
                      IT training, aptitude reasoning, and communication
                      mastery.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="w-full py-12">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-xl font-mulish font-bold text-white mb-4">
            Our Core Purpose
          </h2>

          <p className="max-w-sm text-sm sm:text-base font-semibold leading-relaxed text-zinc-400 tracking-tighter">
            We exist to empower individuals with the knowledge, tools, and
            confidence to design their own learning journeys and achieve their
            career goals. Our mission is to make high-quality career development
            and mentorship accessible to everyone.
          </p>
        </div>
      </section>

      <section className="w-full py-16">
        <div className="mx-auto max-w-7xl  grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-12 text-center">
          <div className="w-full flex flex-col items-center justify-center text-center space-y-3">
            <Zap className="text-[#c0c1ff] h-12 w-12" />
            <p className="max-w-40 text-white font-bold">Practical IT</p>
          </div>
          <div className="w-full flex flex-col items-center justify-center text-center space-y-3">
            <Atom className="text-[#c0c1ff] h-12 w-12" />
            <p className="max-w-40 text-white font-bold">Aptitude Skills</p>
          </div>
          <div className="w-full flex flex-col items-center justify-center text-center space-y-3">
            <MessageSquareDot className="text-[#c0c1ff] h-12 w-12" />
            <p className="max-w-40 text-white font-bold">AI Training</p>
          </div>
          <div className="w-full flex flex-col items-center justify-center text-center space-y-3">
            <ListCheck className="text-[#c0c1ff] h-12 w-12" />
            <p className="max-w-40 text-white font-bold">Job Offers</p>
          </div>
          <div className="w-full flex flex-col items-center justify-center text-center space-y-3">
            <Book className="text-[#c0c1ff] h-12 w-12" />
            <p className="max-w-40 text-white font-bold">Courses</p>
          </div>
          <div className="w-full flex flex-col items-center justify-center text-center space-y-3">
            <Trophy className="text-[#c0c1ff] h-12 w-12" />
            <p className="max-w-40 text-white font-bold">Carrer Growth</p>
          </div>
          <div className="w-full flex flex-col items-center justify-center text-center space-y-3">
            <ScanFace className="text-[#c0c1ff] h-12 w-12" />
            <p className="max-w-40 text-white font-extrabold">MentorShip</p>
          </div>
          <div className="w-full flex flex-col items-center justify-center text-center space-y-3">
            <Clock className="text-[#c0c1ff] h-12 w-12" />
            <p className="max-w-40 text-white font-bold">Flexible Learning</p>
          </div>
        </div>
      </section>
      <section className="w-full py-24">
        <div className="mx-auto max-w-7xl  text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-mulish font-extrabold  mx-auto max-w-3xl text-white">
            Analyze your progress visually and track your learning path at a
            glance.
          </h2>
          <p className="text-3xl sm:text-4xl lg:text-5xl mt-4 font-bold text-zinc-400 max-w-3xl mx-auto">
            Every milestone you achieve is reflected through data-driven
            dashboards and success graphs.
          </p>
        </div>
      </section>

      <section className="w-full py-20 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-6">
          {/* Title */}
          <h2 className="text-3xl md:text-4xl font-extrabold text-zinc-800 font-mulish mb-31 md:mb-12 text-center">
            Career Growth Journey
          </h2>
          {/* Chart Wrapper */}
          <div className="relative h-[360px] flex items-end justify-between">
            {/* Bars */}
            {growthData.map((item, i) => (
              <div key={i} className="relative flex-1 flex justify-center">
                {/* Bar */}
                <div
                  className="w-8 sm:w-12 md:w-16 lg:w-20 bg-gradient-to-t from-blue-600 to-blue-400"
                  style={{ height: `${item.value * 2}px` }}
                />

                {/* Floating avatar */}
                {avatars.map(
                  (avatar, idx) =>
                    avatar.index === i && (
                      <div
                        key={idx}
                        className="absolute -top-12 z-20"
                        style={{ bottom: `${item.value * 2 + 20}px` }}
                      >
                        <img
                          src={avatar.img}
                          alt="profile"
                          className="w-12 h-12 object-contain rounded-full border-4 border-gray-200 shadow-lg"
                        />
                      </div>
                    ),
                )}

                {/* Label */}
                <span className="absolute -bottom-8 md:-bottom-6 text-xs sm:text-sm font-bold text-muted-foreground">
                  {item.label}
                </span>
              </div>
            ))}

            {/* Predictive Line */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 1000 400"
              preserveAspectRatio="none"
            >
              <path
                d="M 50 300 
                 C 250 280, 450 180, 650 120 
                 S 950 10, 950 -100"
                fill="none"
                stroke="rgba(59,130,246,0.6)"
                strokeWidth="4"
                strokeDasharray="8 6"
              />
            </svg>
          </div>
          <div className="flex justify-center text-center min-w-full">
            <p className="text-2xl md:text-3xl font-semibold text-zinc-400 mt-20 max-w-2xl">
              We shape your career growth journey by transforming your potential
              into your best professional version.
            </p>
          </div>
          {/* Decorative grid */}
          {/* <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(0,0,0,0.04)_1px,transparent_1px)] bg-[size:80px_100%]" /> */}
        </div>
      </section>
      <section className="w-full py-12">
        <div className="space-y-4">
          <img
            src="/assets/akg.jpg"
            alt="AKG"
            className="rounded-full w-3/18 md:w-1/18 border-4 border-zinc-200"
          />
          <h2 className="flex gap-3 text-xl font-mulish font-bold text-white mb-4">
            Career Guidance
          </h2>
          <div className="max-w-sm font-semibold leading-tighter text-zinc-400 tracking-tighter">
            Curated videos and expert resources to help you build the career you
            want. Watch, learn, and grow with mentorship at your fingertips.
          </div>
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12">
            {videos.map((src, i) => (
              <div
                key={i}
                className="aspect-video rounded-2xl overflow-hidden border shadow-lg"
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
            <p className="flex flex-col space-y-4 rounded-2xl justify-center items-center text-center md:bg-white/5 md:border md:border-white/10">
              <a
                href="https://www.youtube.com/@Anilkumarguidance"
                className="flex items-center text-sm font-semibold text-zinc-300 hover:text-white"
                target="_blank"
              >
                View Our YT Page
                <ArrowUpRight className="w-5 h-5 ml-1" />
              </a>
              <a
                href="/carrer-guidance"
                className="flex items-center text-sm font-semibold text-zinc-300 hover:text-white"
              >
                View Our Full Page
                <ArrowDownRight className="w-5 h-5 ml-1" />
              </a>
            </p>
          </div>
        </div>
      </section>
      <TestimonialSlider />
      <section className="relative max-w-7xl mx-auto my-12 py-24 bg-gradient-to-br from-[#0d0d20] via-[rgba(24,24,27,0.8)] to-[#0d0d20] border border-[#c0c1ff]/20 backdrop-blur-xl overflow-hidden">
        <div className="absolute -top-20 -left-20 w-[400px] h-[400px] bg-[#00cfff]/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] bg-[#c0c1ff]/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 px-4 text-center space-y-6">
          <span className="font-jetbrains text-[11px] text-[#4edea3] uppercase tracking-[0.2em]">
            BEGIN_YOUR_JOURNEY ↗
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-mulish text-white">
            Start Your Journey With Us
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto">
            Build skills that matter, gain confidence, and unlock real career opportunities.
          </p>
          <a
            href="/courses"
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#c0c1ff] text-black font-jetbrains font-bold tracking-widest text-[13px] uppercase hover:shadow-[0_0_30px_rgba(0,207,255,0.6)] transition-all"
          >
            Begin Your Learning Path
            <ArrowRightIcon className="w-5 h-5" />
          </a>
        </div>
      </section>
    </div>
    </DarkGradientBg>
  );
};

export default LandingPage;
