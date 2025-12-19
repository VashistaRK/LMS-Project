import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Award,
  Badge,
  BrainCircuit,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  Code,
  MessageSquare,
  Rocket,
  Star,
  Target,
  Users,
} from "lucide-react";

const LandingPage1 = () => {
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
    },
    {
      title: "Technical Skills",
      description:
        "Industry-standard software development and engineering tracks.",
      icon: Code,
      image: "images/abstract_technology_concept.png",
      href: "#technical-skills",
      color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
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
    },
  ];
  const featuredCourses = [
    {
      title: "Enterprise Architecture Patterns",
      description: "Design scalable systems for large organizations.",
      duration: "8 weeks",
      level: "Advanced" as const,
      rating: 4.9,
      image:
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000",
    },
    {
      title: "Strategic Business Communication",
      description: "Master high-stakes negotiation and leadership messaging.",
      duration: "4 weeks",
      level: "Intermediate" as const,
      rating: 4.8,
      image:
        "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=1000",
    },
    {
      title: "Data Science for Executives",
      description: "Understand data-driven decision making without the code.",
      duration: "6 weeks",
      level: "Beginner" as const,
      rating: 4.7,
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000",
    },
    {
      title: "Cloud Infrastructure Fundamentals",
      description: "Core concepts of AWS, Azure and Google Cloud.",
      duration: "5 weeks",
      level: "Beginner" as const,
      rating: 4.6,
      image:
        "https://images.unsplash.com/photo-1484417894907-623942c8ee29?auto=format&fit=crop&q=80&w=1000",
    },
  ];

  return (
    <div className="text-gray-800 flex flex-col items-center font-Quick overflow-hidden">
      {/* Hero Section */}
      <section className="relative w-full mt-10 min-h-screen overflow-hidden flex items-start justify-center">
        <div className="relative mx-auto max-w-[85rem] px-6 py-28">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <span className="inline-flex items-center rounded-full border border-red-400/30 bg-red-500/10 px-4 py-1 text-sm text-red-500">
                AI‑Powered Learning & Career Guidance
              </span>

              <h1 className="text-4xl font-bold leading-tight sm:text-5xl xl:text-6xl">
                Learn Smarter. <br />
                <span className="bg-gradient-to-r from-red-800 to-red-400 bg-clip-text text-transparent">
                  Build Your Career Faster.
                </span>
              </h1>

              <p className="max-w-xl text-lg text-gray-800">
                Join the premier self-paced learning ecosystem designed for
                ambitious professionals — it mentors you.
                <br /> Master technical skills, refine soft skills, and connect
                with industry-leading employers. Learn with AI tutors, get
                personalized roadmaps, build job‑ready resumes, and connect your
                learning directly to real career opportunities.
              </p>

              <div className="flex flex-wrap gap-4">
                <a
                  href="/courses"
                  className="rounded-2xl bg-red-600 px-8 py-4 font-semibold shadow-lg transition text-gray-200 hover:bg-red-500"
                >
                  Start Learning for Free
                </a>
                <button className="rounded-2xl border border-white/20 px-8 py-4 font-semibold text-white transition hover:bg-white/10">
                  Explore Career Paths
                </button>
              </div>

              {/* Trust Points */}
              <div className="flex flex-wrap gap-6 pt-6 text-sm text-zinc-800">
                <div>🎓 Guided Learning Paths</div>
                <div>🤖 AI Chatbot Mentor</div>
                <div>📄 Resume & Interview Prep</div>
                <div>💼 Job‑Ready Skill Mapping</div>
              </div>
            </div>

            {/* Right Visual Card */}
            <div className="relative">
              <div className="rounded-xl border-t-2 border-l-2 border-t-red-500 border-l-red-500 bg-white/5 p-8 shadow-lg backdrop-blur-xl">
                <img src="images/working.jpeg" alt="working" />
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-24 bg-slate-900 text-white overflow-hidden relative w-full">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-blue-900/20 to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 max-w-[85rem]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-10 order-2 lg:order-1">
              <div>
                <nav className="mb-6 px-4 py-1.5 text-sm max-w-38 font-medium rounded-full border-white/20 bg-white/5 text-blue-200 backdrop-blur">
                  Our Core Purpose
                </nav>
                <h2 className="text-4xl lg:text-5xl font-heading font-bold leading-tight mb-6">
                  Turning Your Degree Into <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                    A Successful Career
                  </span>
                </h2>
                <p className="text-lg text-slate-300 leading-relaxed max-w-xl">
                  A degree gets you to the interview door, but skills get you
                  through it. We are the bridge that connects your academic
                  foundation with the practical demands of the modern IT
                  industry.
                </p>
              </div>

              <div className="grid gap-8">
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

            <div className="relative order-1 lg:order-2">
              <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
                <img
                  src="images/group_of_diverse_students.png"
                  alt="Vision"
                  className="w-full h-auto object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent"></div>
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl">
                    <p className="text-white italic text-lg">
                      "The gap between education and employability is where we
                      build our bridges."
                    </p>
                  </div>
                </div>
              </div>
              {/* Decorative elements behind image */}
              <div className="absolute -z-10 -top-10 -right-10 w-full h-full border-2 border-white/5 rounded-[2.5rem]"></div>
              <div className="absolute -z-10 -bottom-10 -left-10 w-full h-full border-2 border-white/5 rounded-[2.5rem]"></div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-32 bg-background relative">
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        ></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col text-center items-center max-w-3xl mx-auto mb-20">
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
            {/* Feature 1: AI Communication Coach */}
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

            {/* Feature 2: Technical Mastery */}
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

            {/* Feature 3: Aptitude & Exams */}
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

            {/* Feature 4: Company Prep */}
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

            {/* Feature 5: Career Guidance */}
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

            {/* Feature 6: In-Build Jobsite */}
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
      </section>
      {/* Learning Pathways - Immersive Cards */}
      <section className="py-24 bg-background relative overflow-hidden px-18">
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
                Comprehensive Learning Paths
              </h2>
              <p className="text-lg text-muted-foreground">
                Structured curriculums designed to take you from foundational
                knowledge to expert mastery in four key domains.
              </p>
            </div>
            <Button variant="ghost" className="hidden md:flex group">
              View All Paths{" "}
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
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
      <section className="py-24 bg-muted/30 border-y border-border/60 px-18">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="mb-4">Hot Right Now</Badge>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Trending Certifications
            </h2>
            <p className="text-lg text-muted-foreground">
              Top-rated courses selected by industry experts to boost your
              career immediately.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCourses.map((course, index) => (
              <div
                key={index}
                className="group relative bg-card rounded-2xl border border-border/50 overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="aspect-[4/3] overflow-hidden relative">
                  <div className="absolute top-3 left-3 z-10">
                    <Badge className="bg-white/90 text-black hover:bg-white backdrop-blur shadow-sm">
                      {course.level}
                    </Badge>
                  </div>
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
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

          <div className="mt-12 text-center">
            <Button
              size="lg"
              variant="outline"
              className="px-8 h-12 rounded-xl"
            >
              View All Courses
            </Button>
          </div>
        </div>
      </section>

      {/* Self-Learning Advantage - Visual Layout */}
      <section className="py-24 bg-background relative px-18">
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
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden px-18">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-8 leading-tight">
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

      {/* CTA Footer Section - High Impact */}
      <section className="text-blue-950 md:py-20 w-full bg-gradient-to-r from-blue-800/70 via-purple-700/30 to-purple-500/50">
        <div className="mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-heading font-bold mb-8 tracking-tight">
            Ready to Accelerate Your Career?
          </h2>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-12 font-light">
            Join 25,000+ learners who have transformed their careers through our
            platform. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <a href="/Authenticate">
              <Button
                size="lg"
                variant="secondary"
                className="h-16 px-12 text-xl rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
              >
                Start Learning for Free
              </Button>
            </a>
            <a href="/mentorship">
              <Button
                size="lg"
                variant="outline"
                className="h-16 px-12 text-xl rounded-2xl bg-transparent border-2 border-primary-foreground/30 hover:bg-primary-foreground transition-all"
              >
                Become an Instructor
              </Button>
            </a>
          </div>
          <p className="mt-8 text-sm">
            7-day free trial • Cancel anytime • No hidden fees
          </p>
        </div>
      </section>
    </div>
  );
};

export default LandingPage1;
