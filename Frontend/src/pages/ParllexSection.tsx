import { useState, useEffect } from "react";
import { ParallaxProvider, Parallax } from "react-scroll-parallax";
import { GraduationCap, Users, Briefcase } from "lucide-react";

const features = [
  {
    title: "Role‑Based Training by Certified Mentors",
    icon: GraduationCap,
    color: "from-blue-500 to-indigo-600",
    delay: 0,
    description:
      "Learn from certified trainers with real industry experience. Role‑based curricula map directly to how work gets done on real teams.",
  },
  {
    title: "Live Projects, Doubt Clearing, and Job Support",
    icon: Users,
    color: "from-purple-500 to-pink-600",
    delay: 0,
    description:
      "Build with hands‑on labs and live projects. Get real‑time Q&A, resume reviews, and ongoing support to clear interviews with confidence.",
  },
    {
    title: "Placements, Certification, and Hiring Network",
    icon: Briefcase,
    color: "from-red-500 to-red-600",
    delay: 0,
    description:
      "Access placement assistance, recognized certifications, and a strong hiring network across leading companies and startups.",
  },
];

export default function ParallaxBusiness() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 769);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <ParallaxProvider>
      <section className="relative w-full min-h-[120vh]">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-blue-50 -z-10" />

        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-400 rounded-full blur-3xl" />
        </div>

        {/* Sticky Content Container */}
        <div className="sticky top-0 h-screen flex flex-col justify-center items-center px-4 sm:px-8 py-20">
          <div className="max-w-6xl w-full space-y-8 sm:space-y-12">
            {/* Section Header */}
            <Parallax
              translateY={["80px", "0px"]}
              opacity={[0, 1]}
              easing="easeOut"
            >
              <div className="text-center mb-12 sm:mb-16">
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
                  Why Learners Choose Our LMS
                </h2>
                <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                  World‑class training, live projects, certification, and placement support—end to end.
                </p>
              </div>
            </Parallax>

            {/* Feature Cards */}
            <div className="space-y-6 sm:space-y-8">
              {features.map((feature, index) => (
                <Parallax
                  key={index}
                  translateX={
                    index === 0
                      ? ["300px", "0px"]
                      : index === 1
                      ? ["-300px", "0px"]
                      : ["0px", "0px"]
                  }
                  translateY={
                    index === 0
                      ? ["-100px", "0px"]
                      : index === 1
                      ? ["100px", "0px"]
                      : ["150px", "0px"]
                  }
                  rotate={
                    index === 0 ? [25, 0] : index === 1 ? [-15, 0] : [0, 0]
                  }
                  startScroll={isMobile ? 3400 : 5200}
                  endScroll={isMobile ? 3800 : 5700}
                  opacity={[0, 1]}
                  easing="easeInOutCubic"
                >
                  <div
                    className="group relative bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden"
                    style={{
                      animationDelay: `${feature.delay}s`,
                    }}
                  >
                    {/* Gradient Background on Hover */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                    />

                    {/* Content */}
                    <div className="relative flex flex-col gap-6">
                      {/* Top Row: Icon, Title, Arrow */}
                      <div className="flex items-start gap-4 sm:gap-6">
                        {/* Icon */}
                        <div
                          className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl border  ${feature.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500`}
                        >
                          <feature.icon className="w-6 h-6 sm:w-8 sm:h-8" />
                        </div>

                        {/* Title */}
                        <div className="flex-1">
                          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-600 transition-all duration-500">
                            {feature.title}
                          </h3>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="pl-0 sm:pl-[88px]">
                        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Border Accent */}
                    <div
                      className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}
                    />
                  </div>
                </Parallax>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative Floating Elements */}
        <div className="absolute top-1/4 right-10 w-20 h-20 bg-blue-200 rounded-full blur-xl opacity-30 animate-pulse" />
        <div
          className="absolute bottom-1/4 left-10 w-32 h-32 bg-purple-200 rounded-full blur-xl opacity-30 animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </section>
    </ParallaxProvider>
  );
}
