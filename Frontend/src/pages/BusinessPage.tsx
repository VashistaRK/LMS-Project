// src/App.jsx
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { businessFeatures } from "./businessFeatures";

function BusinessPage() {
  const [isFixed, setIsFixed] = useState(false);
  useEffect(() => {
    const handleScroll = () => setIsFixed(window.scrollY > 800);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col mb-140 items-center justify-start overflow-hidden bg-gradient-to-b from-gray-500/50 to-white">
      {/* Top Button */}
      <div className="absolute mt-10 ml-10 w-full flex justify-start p-6">
        <button className="flex items-center gap-2 bg-[#E10600] text-white px-6 py-3 rounded-full text-2xl font-medium hover:bg-[#B00000] transition">
          <ArrowRight size={40} />
          Start Learning
        </button>
      </div>

      {/* Section with sticky card */}
      <div className="absolute w-10/12 md:w-4/5 clipped-box h-[1460px] rounded-3xl overflow-hidden shadow-xl mt-10">
        {/* Animated Color Waves */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-[#7F1D1D] via-[#DC2626] to-[#EF4444]"
          animate={{
            backgroundPosition: [
              "0% 25%",
              "25% 50%",
              "50% 75%",
              "100% 50%",
              "0% 50%",
            ],
          }}
          transition={{
            duration: 10,
            ease: "linear",
            repeat: Infinity,
          }}
          style={{
            backgroundSize: "300% 300%",
            filter: "blur(0px)",
          }}
        />

        {/* Sticky Floating Card */}
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className={`${isFixed ? "fixed" : "relative"} bottom-0 border-2 border-[#E5E5E5] bg-[#FFFFFF] rounded-2xl shadow-lg w-11/12 md:w-2/3 p-6 flex flex-col items-start`}
        >
          {/* Header */}
          <div className="flex items-center justify-between w-full mb-6">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-[#FF2E2E]"></div>
              <h2 className="text-lg font-semibold text-[#2D2D2D]">
                Enterprise LMS Suite
              </h2>
            </div>
            <span className="text-[#B00000] font-medium">
              Trusted by 3000+ Companies
            </span>
          </div>

          <div className="p-6 text-center">
            <h3 className="text-xl font-bold text-[#1B1B1B] mb-2">
              Role-Based Training, Real Outcomes
            </h3>
          </div>

          {/* Scroll-In Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full">
            {businessFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="relative hover:cursor-pointer group rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
              >
                {/* Feature Image */}
                <img
                  src={feature.img}
                  alt={feature.title}
                  className="w-full h-80 object-cover object-center transform group-hover:scale-110 transition-transform duration-700"
                />

                {/* Overlay Content */}
                <div className="absolute inset-0 bg-[#1B1B1B]/70 flex flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-12">
                  <h3 className="text-2xl font-semibold text-[#FFFFFF] mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-[#E5E5E5]">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default BusinessPage;

export function BusinessPageMobile() {
  return (
    <div className="w-full bg-gradient-to-br rounded-xl to-[#E10600] from-[#F5C542] p-4 flex flex-col">
      {/* Header / CTA */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[#FFFFFF] text-2xl font-bold">Enterprise LMS Suite</h1>
        <button className="flex items-center gap-2 bg-[#E10600] text-white px-4 py-2 rounded-full text-base font-medium hover:bg-[#B00000] transition">
          <ArrowRight size={20} />
          Book Demo
        </button>
      </div>

      {/* Floating Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8 }}
        className="bg-[#FFFFFF] rounded-xl shadow-lg p-4 space-y-4"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-[#2D2D2D]">
            Role-Based Training
          </h2>
          <span className="text-[#B00000] text-sm">
            Trusted by 3000+ Companies
          </span>
        </div>

        <div className="bg-[#F5C542]/20 rounded-lg p-4 text-center">
          <h3 className="text-xl font-bold text-[#1B1B1B] mb-2">
            Mentors, Projects, Outcomes
          </h3>
          <p className="text-[#2D2D2D] text-sm">
            Certified mentors, live projects, and interview preparation to get
            you job-ready.
          </p>
        </div>

        {businessFeatures.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: index * 0.15 }}
            className="relative w-full group"
          >
            {/* Card Content */}
            <div className="relative bg-[#FFFFFF] rounded-lg p-4 shadow-md border-2 border-[#E5E5E5] active:shadow-xl active:border-[#F5C542] transition-all duration-300 z-10">
              <h3 className="text-lg font-bold text-[#2D2D2D] mb-2">
                {feature.title}
              </h3>
              <p className="text-[#2D2D2D] text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
