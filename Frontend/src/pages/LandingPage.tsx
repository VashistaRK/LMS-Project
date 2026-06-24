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

/**
 * M-Glass theme — white canvas, colored blobs, frosted glass cards.
 * Hero adds a background image with white-frost overlay.
 *   ink #18181b · accent indigo-500 · gradients fuchsia↔cyan↔amber
 *   display Outfit · body Inter
 */

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
    <div
      className="relative w-full overflow-hidden bg-white text-zinc-900"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@500;600;700;800;900&display=swap" />

      {/* Global colored blob layer */}
      <div className="pointer-events-none fixed inset-0 -z-0">
        <div className="absolute -top-40 left-1/4 h-[600px] w-[600px] rounded-full bg-fuchsia-300/35 blur-3xl" />
        <div className="absolute top-40 right-0 h-[500px] w-[500px] rounded-full bg-cyan-300/35 blur-3xl" />
        <div className="absolute top-[700px] left-0 h-[500px] w-[500px] rounded-full bg-amber-300/30 blur-3xl" />
        <div className="absolute top-[1100px] right-1/4 h-[500px] w-[500px] rounded-full bg-emerald-300/30 blur-3xl" />
        <div className="absolute top-[1700px] left-1/3 h-[500px] w-[500px] rounded-full bg-violet-300/30 blur-3xl" />
      </div>

      {/* HERO — full-bleed bg image, text overlay (image extends behind floating header) */}
      <section className="relative z-0 flex w-full min-h-[80vh] items-start overflow-hidden pt-24 sm:min-h-[88vh] sm:items-center">
        {/* Hero bg video — full fit */}
        <div className="absolute inset-0 -z-10">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4"
          />
          {/* Subtle wash so video still shows; left-darker for text contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 w-full px-4 py-4 sm:px-6 sm:py-6 md:px-10 md:py-8">
          <div className="max-w-3xl">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/30 bg-white/15 px-4 py-1.5 text-sm font-medium text-white backdrop-blur md:text-base">
              <span className="text-fuchsia-300">↗</span> Career Mastery Platform
            </span>

            <h1
              className="mt-6 text-[36px] font-extrabold leading-[1.05] tracking-[-0.035em] text-white drop-shadow-lg sm:text-[56px] md:text-[72px] xl:text-[92px]"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Career Mastery.
              <br />
              <span className="bg-gradient-to-r from-fuchsia-300 via-violet-300 to-cyan-300 bg-clip-text text-transparent">
                Starts Here.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-snug text-white/90 drop-shadow md:text-xl xl:text-2xl">
              Bridging the gap between academic theory and corporate reality. Master the engineering skills demanded by top-tier firms.
            </p>

            <div className="mt-6 inline-block rounded-2xl border border-white/30 bg-white/15 px-5 py-3 backdrop-blur-md">
              <p className="text-base font-medium text-white md:text-lg">
                Practice with real papers. Crack real interviews.
              </p>
            </div>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center">
              {[
                { value: "50+", label: "Companies" },
                { value: "200+", label: "Papers" },
                { value: "94%", label: "Success" },
                { value: "5+", label: "Years" },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border border-white/30 bg-white/15 px-5 py-3 backdrop-blur-md">
                  <div
                    className="text-3xl font-extrabold leading-none text-white md:text-[34px]"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    {s.value}
                  </div>
                  <div className="mt-1 text-sm font-medium text-white/80 md:text-base">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <Link to="/Authenticate" className="w-full sm:w-auto">
                <button className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-white px-6 py-3 text-base font-bold text-zinc-900 shadow-xl transition hover:bg-zinc-100 sm:w-auto sm:px-8 sm:py-4 md:text-lg">
                  Start Learning
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              </Link>
              <button className="w-full rounded-full border border-white/40 bg-white/10 px-6 py-3 text-base font-bold text-white backdrop-blur-md transition hover:bg-white/20 sm:w-auto sm:px-8 sm:py-4 md:text-lg">
                View Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Below hero */}
      <div className="relative z-10 mx-4 max-w-7xl xl:mx-auto">
        <section className="w-full py-20">
          <div className="mx-auto max-w-7xl space-y-6">
            <h2 className="text-xl font-bold text-zinc-900" style={{ fontFamily: "'Outfit', sans-serif" }}>What You'll Learn Here</h2>

            <div className="text-sm leading-relaxed text-zinc-600 sm:text-base">
              <p>
                You will develop strong aptitude and logical reasoning skills, sharpen your problem-solving mindset, and build the analytical thinking required for real-world technical and business challenges.
              </p>
              <p className="pt-3">
                The platform also focuses on IT fundamentals, hands-on technical training, and communication skills — helping you gain clarity, confidence, and job-ready expertise aligned with industry expectations.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[
                { title: "AI-Powered Communication Mastery", body: "Develop executive presence, public speaking, and professional business writing with AI-driven coaching.", bullets: ["Real-time feedback", "Scenario-based practice"], href: "/freshers-pratice#communications", img: "/assets/abstract_communication_concept.png" },
                { title: "Aptitude & Logical", body: "Build strong logical reasoning and quantitative aptitude with guided practice, and speed-focused drills.", bullets: ["Speed math tricks", "Real interview-level questions"], href: "/freshers-pratice#logical-aptitude", img: "/assets/abstract_logic_and_aptitude_concept.png" },
                { title: "Tech Track", body: "Go beyond theory. Learn by building real systems, writing real code, and solving real industry problems.", bullets: ["Hands-on coding practice", "Industry-aligned learning"], href: "/freshers-pratice#technical-skills", img: "/assets/abstract_technology_concept.png" },
              ].map((f) => (
                <div
                  key={f.title}
                  className="flex flex-col overflow-hidden rounded-3xl border border-white/60 bg-white/60 shadow-md backdrop-blur-md transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="overflow-hidden">
                    <img src={f.img} alt={f.title} className="aspect-[4/3] w-full object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col gap-4 p-6">
                    <h3
                      className="text-2xl font-extrabold text-zinc-900"
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      {f.title}
                    </h3>
                    <p className="text-base text-zinc-600">{f.body}</p>
                    <ul className="space-y-2 text-zinc-700">
                      {f.bullets.map((b) => (
                        <li key={b} className="flex items-center gap-2">
                          <Check className="h-5 w-5 text-fuchsia-500" /> {b}
                        </li>
                      ))}
                    </ul>
                    <a href={f.href} className="mt-auto pt-2">
                      <button className="w-full rounded-full bg-zinc-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-zinc-800 md:text-base">
                        Start Practicing
                      </button>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full py-12">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-4 text-xl font-bold text-zinc-900" style={{ fontFamily: "'Outfit', sans-serif" }}>Mastery Through Self-Learning</h2>

            <div className="text-sm leading-relaxed text-zinc-600 sm:text-base">
              <p>
                Our platform is built on the principle that the deepest learning happens when you are in the driver's seat. We provide the map; you choose the speed and the destination.
              </p>
              <p className="pt-3">
                With a wealth of resources and guidance, you have the freedom and flexibility to shape your personal and professional growth on your own terms.
              </p>
            </div>

            <div className="relative mt-10 flex min-h-[80vh] w-full items-center justify-center overflow-hidden rounded-3xl border border-white/50 shadow-xl">
              <div className="absolute inset-0 z-0">
                <img src="/assets/group_of_diverse_students.png" alt="Background" className="h-full w-full object-cover" />
              </div>
              <div className="absolute inset-0 z-[1] bg-gradient-to-br from-white/30 via-white/20 to-white/30" />

              <div className="relative z-10 max-w-4xl px-6 text-start md:text-center">
                <h2 className="mb-6 text-4xl font-extrabold leading-tight text-zinc-900 md:text-6xl" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  Turning Your Degree Into <br />
                  <span className="bg-gradient-to-r from-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">A Successful Career</span>
                </h2>
                <p className="mx-auto max-w-3xl text-lg leading-relaxed text-zinc-700 md:text-xl">
                  We bridge the gap between academics and industry by blending real-world engineering skills, system thinking, and modern DevOps practices.
                </p>
                <div className="mt-12 grid gap-8 md:grid-cols-2">
                  <div className="flex gap-5 rounded-2xl border border-white/50 bg-white/50 p-5 backdrop-blur-md">
                    <div className="mt-1 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-violet-600 text-white shadow-lg">
                      <Target className="h-7 w-7" />
                    </div>
                    <div className="text-left">
                      <h3 className="mb-3 text-xl font-extrabold text-zinc-900" style={{ fontFamily: "'Outfit', sans-serif" }}>Our Vision</h3>
                      <p className="leading-relaxed text-zinc-700">
                        To ensure every degree student graduates with more than just a certificate. We envision a world where academic foundations are seamlessly fused with industry-ready skills.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-5 rounded-2xl border border-white/50 bg-white/50 p-5 backdrop-blur-md">
                    <div className="mt-1 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg">
                      <Rocket className="h-7 w-7" />
                    </div>
                    <div className="text-left">
                      <h3 className="mb-3 text-xl font-extrabold text-zinc-900" style={{ fontFamily: "'Outfit', sans-serif" }}>Our Mission</h3>
                      <p className="leading-relaxed text-zinc-700">
                        To bridge the gap between campus and corporate by providing a holistic learning path. We integrate practical IT training, aptitude reasoning, and communication mastery.
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
            <h2 className="mb-4 text-xl font-bold text-zinc-900" style={{ fontFamily: "'Outfit', sans-serif" }}>Our Core Purpose</h2>
            <p className="text-sm leading-relaxed text-zinc-600 sm:text-base">
              We exist to empower individuals with the knowledge, tools, and confidence to design their own learning journeys and achieve their career goals. Our mission is to make high-quality career development and mentorship accessible to everyone.
            </p>
          </div>
        </section>

        <section className="w-full py-16">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {[
              { Icon: Zap, label: "Practical IT", c: "from-fuchsia-400 to-violet-500" },
              { Icon: Atom, label: "Aptitude Skills", c: "from-cyan-400 to-blue-500" },
              { Icon: MessageSquareDot, label: "AI Training", c: "from-amber-400 to-orange-500" },
              { Icon: ListCheck, label: "Job Offers", c: "from-emerald-400 to-teal-500" },
              { Icon: Book, label: "Courses", c: "from-violet-400 to-purple-500" },
              { Icon: Trophy, label: "Career Growth", c: "from-rose-400 to-pink-500" },
              { Icon: ScanFace, label: "Mentorship", c: "from-sky-400 to-indigo-500" },
              { Icon: Clock, label: "Flexible Learning", c: "from-lime-400 to-emerald-500" },
            ].map(({ Icon, label, c }) => (
              <div key={label} className="flex flex-col items-center space-y-3 rounded-2xl border border-zinc-400 bg-white/50 p-6 text-center backdrop-blur-md transition hover:bg-white/70 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.80)] ring-1 ring-zinc-900/20">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${c} text-white shadow-md`}>
                  <Icon className="h-6 w-6" />
                </div>
                <p className="font-bold text-zinc-900">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="w-full py-24">
          <div className="mx-auto max-w-7xl text-center">
            <h2 className="mx-auto max-w-3xl text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl lg:text-5xl" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Analyze your progress visually and track your learning path at a glance.
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-3xl font-bold text-zinc-400 sm:text-4xl lg:text-5xl" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Every milestone you achieve is reflected through data-driven dashboards and success graphs.
            </p>
          </div>
        </section>

        <section className="w-full overflow-hidden pt-20 pb-8">
          <div className="relative mx-auto max-w-7xl rounded-3xl border border-zinc-300 bg-white/50 px-6 pt-10 pb-6 backdrop-blur-md md:px-12 shadow-[0_20px_50px_rgba(0,0,0,0.25)] ring-1 ring-zinc-900/10">
            <h2 className="mb-12 text-center text-3xl font-extrabold text-zinc-900 md:text-4xl" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Career Growth Journey
            </h2>
            <div className="relative flex h-[360px] items-end justify-between">
              {growthData.map((item, i) => (
                <div key={item.label} className="relative flex flex-1 justify-center">
                  <div
                    className="w-8 rounded-t-md bg-gradient-to-t from-violet-600 via-fuchsia-500 to-cyan-400 sm:w-12 md:w-16 lg:w-20"
                    style={{ height: `${item.value * 2}px` }}
                  />
                  {avatars.map(
                    (avatar) =>
                      avatar.index === i && (
                        <div key={avatar.img} className="absolute -top-12 z-20" style={{ bottom: `${item.value * 2 + 20}px` }}>
                          <img
                            src={avatar.img}
                            alt="profile"
                            className="h-12 w-12 rounded-full border-4 border-white object-contain shadow-lg ring-2 ring-fuchsia-400"
                          />
                        </div>
                      ),
                  )}
                  <span className="absolute -bottom-8 text-xs font-bold text-zinc-500 sm:text-sm md:-bottom-6">{item.label}</span>
                </div>
              ))}
              <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1000 400" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="growthLine" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
                <path
                  d="M 50 300 C 250 280, 450 180, 650 120 S 950 10, 950 -100"
                  fill="none"
                  stroke="url(#growthLine)"
                  strokeWidth="4"
                  strokeDasharray="8 6"
                />
              </svg>
            </div>
            <div className="flex min-w-full justify-center text-center">
              <p className="mt-14 max-w-3xl text-lg font-semibold text-zinc-500 md:text-xl lg:text-2xl" style={{ fontFamily: "'Outfit', sans-serif" }}>
                We shape your career growth journey by transforming your potential into your best professional version.
              </p>
            </div>
          </div>
        </section>

        <section className="w-full py-12">
          <div className="space-y-4">
            <img src="/assets/akg.jpg" alt="AKG" className="w-3/18 rounded-full border-4 border-white shadow-lg ring-2 ring-fuchsia-400 md:w-1/18" />
            <h2 className="mb-4 flex gap-3 text-xl font-bold text-zinc-900" style={{ fontFamily: "'Outfit', sans-serif" }}>Career Guidance</h2>
            <div className="leading-relaxed text-zinc-600">
              Curated videos and expert resources to help you build the career you want. Watch, learn, and grow with mentorship at your fingertips.
            </div>
            <div className="mt-12 grid w-full grid-cols-1 gap-6 sm:grid-cols-2">
              {videos.map((src) => (
                <div key={src} className="aspect-video overflow-hidden rounded-2xl border border-white/50 bg-white/40 shadow-lg backdrop-blur-md">
                  <iframe
                    className="h-full w-full"
                    src={src}
                    title={`career-video-${src}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              ))}
              <p className="flex flex-col items-center justify-center space-y-4 rounded-2xl border border-white/50 bg-white/50 p-6 text-center backdrop-blur-md">
                <a
                  href="https://www.youtube.com/@Anilkumarguidance"
                  className="flex items-center text-sm font-semibold text-zinc-700 hover:text-fuchsia-600"
                  target="_blank"
                  rel="noreferrer"
                >
                  View Our YT Page
                  <ArrowUpRight className="ml-1 h-5 w-5" />
                </a>
                <a href="/carrer-guidance" className="flex items-center text-sm font-semibold text-zinc-700 hover:text-fuchsia-600">
                  View Our Full Page
                  <ArrowDownRight className="ml-1 h-5 w-5" />
                </a>
              </p>
            </div>
          </div>
        </section>

        <TestimonialSlider />

        <section className="relative mx-auto my-12 max-w-7xl overflow-hidden rounded-3xl border border-zinc-300 bg-white/40 py-24 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.25)] ring-1 ring-zinc-900/10">
          <div className="pointer-events-none absolute -top-20 -left-20 h-[400px] w-[400px] rounded-full bg-fuchsia-300/40 blur-[120px]" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-[400px] w-[400px] rounded-full bg-cyan-300/40 blur-[120px]" />

          <div className="relative z-10 space-y-6 px-4 text-center">
            <span className="text-sm font-semibold text-fuchsia-600 md:text-base">
              Begin your journey ↗
            </span>
            <h2 className="text-3xl font-extrabold text-zinc-900 sm:text-4xl lg:text-5xl" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Start Your{" "}
              <span className="bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-500 bg-clip-text text-transparent">Journey</span>{" "}
              With Us
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-zinc-600 sm:text-base">
              Build skills that matter, gain confidence, and unlock real career opportunities.
            </p>
            <a
              href="/courses"
              className="inline-flex items-center gap-3 rounded-full bg-zinc-900 px-8 py-4 text-base font-bold text-white shadow-xl transition hover:bg-zinc-800 md:text-lg"
            >
              Begin Your Learning Path
              <ArrowRightIcon className="h-5 w-5" />
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LandingPage;
