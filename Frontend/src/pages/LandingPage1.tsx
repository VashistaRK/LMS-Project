/* eslint-disable */
import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Award,
  BrainCircuit,
  Briefcase,
  // Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Code,
  MessageSquare,
  Rocket,
  Star,
  Target,
  Users,
} from "lucide-react";
import { useCourses } from "@/hooks/queries/courses";
import { useEffect, useRef, useState } from "react";

const LandingPage1 = () => {
  const videoScrollerRef = useRef<HTMLDivElement>(null);

  const [activeIndex, setActiveIndex] = useState(2); // top card index
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimated(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const cards = [
    {
      id: 0,
      title: "Card One",
      color: "bg-blue-700/70",
      image: "images/modern_student_studying_with_laptop.png",
      description: "Launch Your Career",
    },
    {
      id: 1,
      title: "Card Two",
      color: "bg-blue-800/70",
      image: "images/working.jpeg",
      description: "Learn with Purpose",
    },
    {
      id: 2,
      title: "Card Three",
      color: "bg-blue-900/70",
      image: "images/fresher.jpg",
      description: "Turn Ideas into Reality",
    },
  ];

  const getStyles = (index: number) => {
    if (!animated) {
      return "z-10 rotate-0";
    }
    if (index === activeIndex) {
      return "z-30 rotate-0 translate-y-0";
    }
    if (index === activeIndex - 1) {
      return "z-20 rotate-0 md:rotate-[15deg] translate-y-6 translate-12 md:translate-x-6";
    }
    if (activeIndex === 0 && index === 1) {
      return "z-20 rotate-0 md:rotate-[15deg] translate-y-6 translate-12 md:translate-x-6";
    }
    return "z-10 rotate-0 md:rotate-[30deg] translate-y-12 translate-24 md:translate-x-12";
  };

  const scroll = (direction: "left" | "right") => {
    const el = videoScrollerRef.current;
    if (!el) return;
    const scrollAmount = direction === "left" ? -420 : 420;
    el.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const categories = [
    {
      title: "Communications",
      description:
        "Executive presence, public speaking, and business writing mastery.",
      icon: MessageSquare,
      image: "images/abstract_communication_concept.png",
      href: "#communications",
      color:
        "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
      featurePoints: [
        {
          text: "Real-time feedback",
        },
        {
          text: "Scenario-based practice",
        },
      ],
    },
    {
      title: "Aptitude & Logic",
      description:
        "Critical thinking and problem-solving for competitive assessments.",
      icon: BrainCircuit,
      image: "images/abstract_logic_and_aptitude_concept.png",
      href: "#logical-aptitude",
      color:
        "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
      featurePoints: [
        {
          text: "Speed math tricks",
        },
        {
          text: "Pattern recognition",
        },
      ],
    },
    {
      title: "Technical Skills",
      description:
        "Industry-standard software development and engineering tracks.",
      icon: Code,
      image: "images/abstract_technology_concept.png",
      href: "#technical-skills",
      color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
      featurePoints: [
        {
          text: "Personalized roadmap",
        },
        {
          text: "Hands-on coding practice",
        },
      ],
    },
    {
      title: "Career & Jobs",
      description:
        "Direct access to top-tier employment opportunities and placement.",
      icon: Briefcase,
      image: "images/abstract_career_and_growth_concept.png",
      href: "/jobsite",
      color:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
      featurePoints: [
        {
          text: "Verified listings",
        },
        {
          text: "One-click apply",
        },
      ],
    },
  ];
  const sampleFeatured = [
    {
      title: "Enterprise Architecture Patterns",
      description: "Design scalable systems for large organizations.",
      duration: "8 weeks",
      level: "Advanced",
      rating: 4.9,
      image:
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000",
    },
    {
      title: "Strategic Business Communication",
      description: "Master high-stakes negotiation and leadership messaging.",
      duration: "4 weeks",
      level: "Intermediate",
      rating: 4.8,
      image:
        "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=1000",
    },
    {
      title: "Data Science for Executives",
      description: "Understand data-driven decision making without the code.",
      duration: "6 weeks",
      level: "Beginner",
      rating: 4.7,
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000",
    },
    {
      title: "Cloud Infrastructure Fundamentals",
      description: "Core concepts of AWS, Azure and Google Cloud.",
      duration: "5 weeks",
      level: "Beginner",
      rating: 4.6,
      image:
        "https://images.unsplash.com/photo-1484417894907-623942c8ee29?auto=format&fit=crop&q=80&w=1000",
    },
  ];

  const videos = [
    "https://www.youtube.com/embed/eV0m6NowqWA?si=Nz_Nw6-orR3H3raK",
    "https://www.youtube.com/embed/Lv1ABw3RPwc?si=PHJd53FTA73ssqdx",
    "https://www.youtube.com/embed/w6C_ABHXMZU?si=YAEpmOZCDcoE5SVd",
  ];

  const { data: courses = [] } = useCourses();

  const mappedFromApi = (Array.isArray(courses) ? courses : [])
    .slice()
    .sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 4)
    .map((c: any) => {
      const difficulty = (c.difficulty || "").toString().toLowerCase();
      const level = difficulty
        ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
        : "Beginner";

      const APIroot = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
      const image = c.id
        ? `${APIroot}/courses/${c.id}/thumbnail`
        : c.thumbnail?.url || c.image || sampleFeatured[0].image;

      const description = c.shortDescription || c.description || "";

      const duration =
        c.duration || (c.chapterCount ? `${c.chapterCount} chapters` : "");

      return {
        title: c.title || "Untitled Course",
        description,
        duration,
        level,
        rating: c.rating || 0,
        image,
      };
    });

  const featuredCoursesToShow = mappedFromApi.length
    ? mappedFromApi
    : sampleFeatured;

  return (
    <div className="text-gray-800 flex flex-col items-center font-Quick">
      {/* Hero Section */}
      <section className="relative w-full flex items-start justify-center">
        <div className="relative mx-auto max-w-[85rem] px-6 py-8 lg:py-18">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-start font-Quick">
            {/* Left Content */}
            <div className="space-y-8 order-2 lg:order-1">
              <h1 className="text-4xl font-extrabold leading-14 md:leading-18 sm:text-5xl xl:text-6xl">
                <span className="inline-flex items-center border-b border-black/30 py-1 text-sm">
                  AI‑Powered Learning & Career Guidance
                </span>
                <br />
                Learn Smarter. <br />
                <span className="">Elevate Your Career On Your Terms.</span>
              </h1>

              <p className="max-w-xl text-lg text-gray-800">
                Join the premier self-paced learning ecosystem designed for
                ambitious professionals. Master technical skills, refine soft
                skills, and connect with industry-leading employers.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="/courses"
                  className="group relative w-full sm:w-auto overflow-hidden text-center rounded-md px-8 py-4 font-semibold 
               border border-gray-700 shadow-lg text-gray-700 
               transition hover:bg-blue-500/20"
                >
                  {/* Hover animated rotated element */}
                  <div
                    className="absolute inset-0 bg-blue-300 
                 transform rotate-0 scale-0 
                 transition-all duration-500 
                 group-hover:rotate-[225deg] group-hover:scale-150"
                  />

                  {/* Text above the absolute layer */}
                  <span className="relative z-10">Start Learning</span>
                </a>
              </div>
            </div>

            {/* Right Visual Card */}
            <div className="relative w-full flex justify-center order-1 lg:order-2 lg:w-80 lg:ml-[15%] h-[32rem]">
              {cards.map((card, index) => (
                <div
                  key={card.id}
                  onClick={() => setActiveIndex(index)}
                  className={`
                  absolute inset-0 cursor-pointer w-8/12 md:w-auto h-[28rem]
                  flex flex-col items-center justify-center text-white text-xl font-semibold
                  transition-all duration-700 ease-out animate-[fadeUp_0.8s_ease-out] p-2
                  ${getStyles(index)}
                `}
                >
                  <img
                    src={card.image}
                    alt={card.title}
                    className={`w-full h-full object-cover rounded-xl ${activeIndex === index ? "pb-2 shadow-xl" : ""}`}
                  />
                  <span
                    className={`${activeIndex === index ? "relative py-2" : "hidden"} ${card.color} w-full text-center rounded-xl text-lg font-extrabold`}
                  >
                    {card.description}
                  </span>
                </div>
              ))}
            </div>
            {/* <div className="relative w-[420px] h-[520px]  overflow-hidden">
              <div
                className="absolute top-0 right-0 w-[380px] h-[380px] rounded-full bg-no-repeat bg-cover bg-center"
                style={{
                  backgroundImage: "url('images/fresher.jpg')",
                }}
              />
              <div className="absolute bottom-[120px] left-[40px] w-[260px] h-[260px] rounded-full bg-[#f7f7f4]" />
              <div
                className="absolute bottom-0 left-0 w-[120px] h-[120px] rounded-full bg-no-repeat bg-cover bg-center"
                style={{
                  backgroundImage: "url('images/fresher.jpg')",
                  backgroundPosition: "left bottom",
                }}
              />
              <div className="absolute bottom-6 left-20 w-6 h-6 rounded-full bg-slate-900" />
            </div> */}

            <div className="relative lg:absolute hidden lg:block order-3 lg:order-none right-0 bottom-0 h-[16rem] lg:h-full w-full lg:w-[40%] pointer-events-none overflow-hidden mt-16 lg:mt-0">
              <div className="relative h-full w-full">
                <div
                  className="absolute bottom-[20%] right-4 w-32 h-32 rounded-full 
             bg-gradient-to-br from-blue-300/80 to-purple-300/30 
             blur-xl"
                />
                <div
                  className="absolute bottom-[20%] right-4 w-42 h-36 
             border-2 border-blue-400/30 rounded-xl
             rotate-12"
                />
                <div
                  className="absolute bottom-[45%] right-2 w-12 h-12 
             border-4 border-blue-400/30 rounded-xl
             rotate-62"
                />
                <div
                  className="absolute bottom-[55%] right-2 w-12 h-12 
             border-l-[24px] border-r-[24px] border-b-[42px]
             border-l-transparent border-r-transparent
             border-b-blue-400/30 rotate-12"
                />

                <div
                  className="absolute bottom-10 right-40 w-20 h-20 rounded-full
             bg-blue-400/20 blur-xl"
                />
                <div className="absolute bottom-10 right-10 grid grid-cols-3 gap-4 opacity-30">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-blue-500" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="images/group_of_diverse_students.png"
            alt="Background"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Dark Blue Overlay */}
        <div className="absolute inset-0 z-1 bg-gradient-to-br from-blue-950/70 via-slate-900/70 to-black/70" />

        {/* Curved Lines */}
        <svg
          className="absolute inset-0 w-full h-full opacity-20"
          viewBox="0 0 1440 900"
          fill="none"
        >
          <path
            d="M-200 300 C 300 100, 900 600, 1600 300"
            stroke="rgba(96,165,250,0.4)"
            strokeWidth="2"
          />
          <path
            d="M-200 500 C 400 300, 1000 800, 1600 500"
            stroke="rgba(167,139,250,0.3)"
            strokeWidth="1.5"
          />
        </svg>

        {/* Dot Pattern */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="w-full h-full bg-[radial-gradient(circle,_rgba(255,255,255,0.15)_1px,_transparent_1px)] bg-[size:24px_24px]" />
        </div>

        {/* Centered Content */}
        <div className="relative z-10 max-w-4xl text-center px-6">
          <span className="inline-block mb-4 py-1.5 text-sm font-semibold text-blue-300 border-b border-blue-400 backdrop-blur">
            Our Core Purpose
          </span>

          <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
            Turning Your Degree Into <br />
            <span className="text-blue-400">A Successful Career</span>
          </h2>

          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            We bridge the gap between academics and industry by blending
            real-world engineering skills, system thinking, and modern DevOps
            practices.
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
                  To ensure every degree student graduates with more than just a
                  certificate. We envision a world where academic foundations
                  are seamlessly fused with industry-ready skills.
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
                  To bridge the gap between campus and corporate by providing a
                  holistic learning path. We integrate practical IT training,
                  aptitude reasoning, and communication mastery.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Tech Stack Icons
        <div className="absolute inset-0  z-10 pointer-events-none">
          {[
            { icon: <Rocket />, top: "20%", left: "15%", delay: "0s" }, // Docker
            { icon: "☁️", top: "35%", left: "80%", delay: "1s" }, // Cloud
            { icon: "⚙️", top: "65%", left: "20%", delay: "2s" }, // System Design
            { icon: "🧠", top: "70%", left: "75%", delay: "3s" }, // Architecture
            { icon: "💻", top: "50%", left: "50%", delay: "4s" }, // Fullstack
          ].map((item, i) => (
            <div
              key={i}
              className="absolute text-3xl opacity-0 animate-fadeFloat"
              style={{
                top: item.top,
                left: item.left,
                animationDelay: item.delay,
              }}
            >
              {item.icon}
            </div>
          ))}
        </div> */}
      </section>

      {/* <section className="py-12 bg-background relative">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        ></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col text-center items-center max-w-3xl mx-auto mb-10">
            <div className="mb-4 px-4 py-1.5 text-sm font-medium rounded-full border-primary/20 bg-primary/5 text-primary">
              End-to-End Career Ecosystem
            </div>
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6 tracking-tight">
              Everything You Need to Get Hired
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              A comprehensive suite of tools designed to transform students into
              professionals. From AI-driven practice to direct job access.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:px-18">
            <Card className="group h-full border-border/40 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8 flex flex-col h-full">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20 text-purple-600 flex items-center justify-center mb-6 shadow-inner ring-1 ring-purple-500/10">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-3 group-hover:text-purple-600 transition-colors">
                  AI Communication Coach
                </h3>
                <p className="text-muted-foreground mb-6 flex-grow">
                  Practice 1-on-1 speaking with our AI bot to refine your
                  accent, grammar, and confidence. Includes video lessons for
                  Spoken English mastery.
                </p>
                <div className="pt-6 border-t border-border/50">
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-center gap-3">
                      <div className="p-1 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600">
                        <CheckCircle2 className="w-3 h-3" />
                      </div>
                      Real-time feedback
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="p-1 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600">
                        <CheckCircle2 className="w-3 h-3" />
                      </div>
                      Scenario-based practice
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="group h-full border-border/40 hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/5 hover:-translate-y-2 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8 flex flex-col h-full">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 text-blue-600 flex items-center justify-center mb-6 shadow-inner ring-1 ring-blue-500/10">
                  <Code className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-3 group-hover:text-blue-600 transition-colors">
                  20+ Tech Specializations
                </h3>
                <p className="text-muted-foreground mb-6 flex-grow">
                  From C, Java, and Python to Data Science and Cybersecurity.
                  Comprehensive curriculums designed for freshers to build
                  industry-ready skills.
                </p>
                <div className="pt-6 border-t border-border/50">
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-center gap-3">
                      <div className="p-1 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600">
                        <CheckCircle2 className="w-3 h-3" />
                      </div>
                      Hands-on coding labs
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="p-1 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600">
                        <CheckCircle2 className="w-3 h-3" />
                      </div>
                      Capstone projects
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="group h-full border-border/40 hover:border-amber-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/5 hover:-translate-y-2 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8 flex flex-col h-full">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-800/20 text-amber-600 flex items-center justify-center mb-6 shadow-inner ring-1 ring-amber-500/10">
                  <BrainCircuit className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-3 group-hover:text-amber-600 transition-colors">
                  Aptitude & Logic Lab
                </h3>
                <p className="text-muted-foreground mb-6 flex-grow">
                  Master the critical thinking tests used by top recruiters.
                  Extensive question banks, timed mock exams, and logic building
                  modules.
                </p>
                <div className="pt-6 border-t border-border/50">
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-center gap-3">
                      <div className="p-1 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-600">
                        <CheckCircle2 className="w-3 h-3" />
                      </div>
                      Speed math tricks
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="p-1 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-600">
                        <CheckCircle2 className="w-3 h-3" />
                      </div>
                      Pattern recognition
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="group h-full border-border/40 hover:border-slate-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-500/5 hover:-translate-y-2 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8 flex flex-col h-full">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800/50 dark:to-slate-700/30 text-slate-600 flex items-center justify-center mb-6 shadow-inner ring-1 ring-slate-500/10">
                  <Building2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-3 group-hover:text-slate-600 transition-colors">
                  Targeted Company Prep
                </h3>
                <p className="text-muted-foreground mb-6 flex-grow">
                  Crack interviews of 200+ specific companies. Access last 4
                  years' placement papers, interview experiences, and
                  company-specific patterns.
                </p>
                <div className="pt-6 border-t border-border/50">
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-center gap-3">
                      <div className="p-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600">
                        <CheckCircle2 className="w-3 h-3" />
                      </div>
                      Previous year papers
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="p-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600">
                        <CheckCircle2 className="w-3 h-3" />
                      </div>
                      HR interview questions
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="group h-full border-border/40 hover:border-rose-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-rose-500/5 hover:-translate-y-2 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8 flex flex-col h-full">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-100 to-rose-50 dark:from-rose-900/30 dark:to-rose-800/20 text-rose-600 flex items-center justify-center mb-6 shadow-inner ring-1 ring-rose-500/10">
                  <Target className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-3 group-hover:text-rose-600 transition-colors">
                  Career Guidance
                </h3>
                <p className="text-muted-foreground mb-6 flex-grow">
                  Confused about which path to take? Get expert counseling to
                  choose the best course based on your strengths and market
                  trends.
                </p>
                <div className="pt-6 border-t border-border/50">
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-center gap-3">
                      <div className="p-1 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-600">
                        <CheckCircle2 className="w-3 h-3" />
                      </div>
                      Personalized roadmap
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="p-1 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-600">
                        <CheckCircle2 className="w-3 h-3" />
                      </div>
                      Resume building
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="group h-full border-border/40 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/5 hover:-translate-y-2 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8 flex flex-col h-full">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-800/20 text-emerald-600 flex items-center justify-center mb-6 shadow-inner ring-1 ring-emerald-500/10">
                  <Briefcase className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-3 group-hover:text-emerald-600 transition-colors">
                  Exclusive Fresher Jobsite
                </h3>
                <p className="text-muted-foreground mb-6 flex-grow">
                  Direct access to pan-India fresher openings. We aggregate and
                  verify job postings specifically relevant for entry-level
                  graduates.
                </p>
                <div className="pt-6 border-t border-border/50">
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-center gap-3">
                      <div className="p-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600">
                        <CheckCircle2 className="w-3 h-3" />
                      </div>
                      Verified listings
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="p-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600">
                        <CheckCircle2 className="w-3 h-3" />
                      </div>
                      One-click apply
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section> */}
      {/* Learning Pathways - Immersive Cards */}
      <section className="py-12 mt-20 bg-background relative overflow-hidden px-8 md:px-18">
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
        <div className="container mx-auto md:px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-6xl font-extrabold mb-4">
                Comprehensive Learning Paths
              </h2>
              <p className="text-3xl text-muted-foreground">
                Structured curriculums designed to take you from foundational
                knowledge to expert mastery in four key domains.
              </p>
            </div>
            {/* <Button variant="ghost" className="hidden md:flex group">
              View All Paths{" "}
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button> */}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {categories.map((category) => (
              <a
                key={category.title}
                href={category.href}
                className="block group h-full"
              >
                <div className="relative h-full overflow-hidden rounded-3xl border border-border/50 bg-card hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-700"></div>

                  <div className="flex flex-col md:flex-row h-full">
                    <div className="w-full md:w-2/5 relative overflow-hidden min-h-[240px] md:min-h-0">
                      <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/0 transition-colors z-10" />
                      <img
                        src={category.image}
                        alt={category.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>
                    <div className="flex-1 p-8 flex flex-col justify-center relative z-10">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${
                          category.color.split(" ")[0]
                        } ${category.color.split(" ")[1]}`}
                      >
                        <category.icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-2xl font-heading font-bold mb-3 group-hover:text-primary transition-colors">
                        {category.title}
                      </h3>
                      <p className="text-muted-foreground mb-6 leading-relaxed">
                        {category.description}
                      </p>
                      <div className="pb-6">
                        <ul className="space-y-3 text-sm text-muted-foreground">
                          {category.featurePoints.map((point, index) => (
                            <li key={index} className="flex items-center gap-3">
                              <div
                                className={`
                                p-1 rounded-full
                                ${category.color.split(" ")[0]}
                                ${category.color.split(" ")[1]}
                              `}
                              >
                                <CheckCircle2 className="w-3 h-3" />
                              </div>
                              {point.text}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <a
                        href={`/freshers-pratice${category.href.toLowerCase()}`}
                        className="flex items-center text-sm font-bold text-primary mt-auto group/link"
                      >
                        Explore Track{" "}
                        <ArrowRight className="ml-2 w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                      </a>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Button variant="outline" className="w-full">
              View All Paths
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Courses - Polished Grid */}
      <section className="py-24 bg-muted/30 border-y border-border/60 px-8 md:px-18">
        <div className="container mx-auto px-4">
          <div className="text-center flex flex-col items-center max-w-3xl mx-auto mb-16">
            <div className="border-b-2 max-w-fit mb-4">Hot Right Now</div>
            <h2 className="text-3xl md:text-6xl font-heading font-bold mb-4">
              Trending Certifications
            </h2>
            <p className="text-2xl text-muted-foreground">
              Top-rated courses selected by industry experts to boost your
              career immediately.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredCoursesToShow.map((course, index) => (
              <div
                key={index}
                className="group relative bg-card rounded-2xl border border-border/50 overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
              >
                <div className="aspect-[4/3] overflow-hidden relative w-full">
                  <div className="absolute top-3 left-3 z-10">
                    <span className="bg-white/90 text-black hover:bg-white rounded-2xl px-2 backdrop-blur shadow-sm">
                      {course.level}
                    </span>
                  </div>
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1 text-yellow-500 mb-2">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-medium text-foreground">
                        {course.rating}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        (450+ reviews)
                      </span>
                    </div>
                    <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {course.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border/50 text-xs font-medium text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {course.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      1.2k enrolled
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 flex items-center justify-center text-center">
            <a
              href={`/courses`}
              className="flex items-center border border-gray-400 bg-gray-100 rounded-3xl px-6 py-3 text-sm font-bold text-primary mt-auto group/link"
            >
              View All Courses{" "}
              <ArrowRight className="ml-2 w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </section>

      {/* Self-Learning Advantage - Visual Layout */}
      <section className="py-24 bg-background relative px-8 md:px-18">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
              <div className="grid grid-cols-2 gap-4 relative z-10">
                <div className="space-y-4 mt-8">
                  <div className="bg-card p-6 rounded-2xl border shadow-lg">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                      <Clock className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold mb-1">Flexible Pacing</h4>
                    <p className="text-sm text-muted-foreground">
                      Learn at your own speed, 24/7 access.
                    </p>
                  </div>
                  <div className="bg-card p-6 rounded-2xl border shadow-lg">
                    <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4">
                      <BrainCircuit className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold mb-1">AI-Powered</h4>
                    <p className="text-sm text-muted-foreground">
                      Personalized curriculum adjustments.
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-card p-6 rounded-2xl border shadow-lg">
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-4">
                      <Target className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold mb-1">Project-Based</h4>
                    <p className="text-sm text-muted-foreground">
                      Build a real portfolio while learning.
                    </p>
                  </div>
                  <div className="bg-card p-6 rounded-2xl border shadow-lg">
                    <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center mb-4">
                      <Award className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold mb-1">Certified</h4>
                    <p className="text-sm text-muted-foreground">
                      Industry-recognized credentials.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6">
                Mastery Through Self-Learning
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Our platform is built on the principle that the deepest learning
                happens when you are in the driver's seat. We provide the map;
                you choose the speed and the destination.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground">
                      No rigid schedules
                    </h4>
                    <p className="text-muted-foreground">
                      Whether you're a night owl or an early bird, access course
                      materials whenever you're ready.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground">
                      Learn by Doing
                    </h4>
                    <p className="text-muted-foreground">
                      Don't just watch videos. Prove your skills by building
                      real-world projects.
                    </p>
                  </div>
                </li>
              </ul>
              <Button size="lg" className="rounded-xl px-8">
                Start Your Journey
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props / Why Choose Us - Dark Mode */}
      <section className="py-24 bg-slate-950 text-white relative overflow-hidden px-8 md:px-18">
        {/* <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div> */}
        {/* <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div> */}

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-6xl font-bold mb-8 leading-tight">
                Why Industry Leaders <br />
                <span className="text-blue-400">Hire Our Graduates</span>
              </h2>
              <div className="space-y-8">
                <div className="flex gap-5 group">
                  <div className="mt-1 flex-shrink-0 w-12 h-12 rounded-xl bg-white/5 border border-white/10 group-hover:bg-green-500/20 group-hover:border-green-500/30 transition-all text-green-400 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      Verified Skill Assessment
                    </h3>
                    <p className="text-slate-400 leading-relaxed">
                      Our aptitude and technical tests are calibrated to
                      industry standards, giving you a badge that employers
                      actually trust.
                    </p>
                  </div>
                </div>
                <div className="flex gap-5 group">
                  <div className="mt-1 flex-shrink-0 w-12 h-12 rounded-xl bg-white/5 border border-white/10 group-hover:bg-blue-500/20 group-hover:border-blue-500/30 transition-all text-blue-400 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      Holistic Development
                    </h3>
                    <p className="text-slate-400 leading-relaxed">
                      We don't just teach code. We teach communication,
                      leadership, and logic - the full package for a successful
                      career.
                    </p>
                  </div>
                </div>
                <div className="flex gap-5 group">
                  <div className="mt-1 flex-shrink-0 w-12 h-12 rounded-xl bg-white/5 border border-white/10 group-hover:bg-purple-500/20 group-hover:border-purple-500/30 transition-all text-purple-400 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Direct Placement</h3>
                    <p className="text-slate-400 leading-relaxed">
                      Top performers get direct interview opportunities with our
                      network of 450+ hiring partners.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl transform rotate-3"></div>
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 rounded-full bg-slate-700 overflow-hidden border-2 border-white/20">
                    <img
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200"
                      alt="Student"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl text-white">
                      Sarah Jenkins
                    </h4>
                    <p className="text-sm text-blue-300">
                      Placed at TechGiant Inc.
                    </p>
                  </div>
                  <div className="ml-auto flex text-yellow-400">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-5 h-5 fill-current" />
                    ))}
                  </div>
                </div>

                <blockquote className="text-xl text-slate-200 leading-relaxed italic mb-8">
                  "The combination of technical coursework and communication
                  training was exactly what I needed. I didn't just learn to
                  code; I learned how to be a professional developer. I got
                  hired within 2 weeks of completing my certification."
                </blockquote>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium text-slate-400">
                    <span>Course Progress</span>
                    <span className="text-green-400">100% Complete</span>
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Career Guidance (condensed content + horizontal video carousel) */}
      <section
        className="py-16 w-full text-black bg-center bg-cover"
        style={{
          backgroundImage: "url(/images/bg-guide.png)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-3">
              Career guidance that actually helps
            </h2>
            <p className="text-gray-900 max-w-2xl mx-auto">
              Short, practical guidance paired with curated videos to help you
              make confident, job‑ready decisions.
            </p>
          </div>
          <div className="relative w-full max-w-7xl mx-auto py-8">
            {/* Left Button (responsive) */}
            <button
              onClick={() => scroll("left")}
              className="absolute left-4 md:left-[-72px] top-1/2 -translate-y-1/2 z-20 bg-black/20 hover:bg-black/40 text-white text-3xl font-bold rounded-full w-12 h-12 md:w-14 md:h-14 flex items-center justify-center backdrop-blur-md shadow-md transition-all duration-300"
            >
              <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
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

            {/* Right Button (responsive) */}
            <button
              onClick={() => scroll("right")}
              className="absolute right-4 md:right-[-72px] top-1/2 -translate-y-1/2 z-20 bg-black/20 hover:bg-black/40 text-white text-3xl font-bold rounded-full w-12 h-12 md:w-14 md:h-14 flex items-center justify-center backdrop-blur-md shadow-md transition-all duration-300"
            >
              <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
            </button>
          </div>
          <div className="flex items-center justify-center">
            <a
              href="/carrer-guidence"
              className="rounded-xl p-4 bg-blue-400 text-xl text-white"
            >
              View All Content
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage1;
