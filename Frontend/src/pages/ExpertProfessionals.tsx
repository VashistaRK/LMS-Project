const ExpertProfessionals = () => {
  return (
    <section
      className="relative w-full bg-center bg-cover bg-no-repeat px-6 py-16 sm:px-12 sm:py-18"
      style={{ backgroundImage: "url(/images/bg.jpg)" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-blue-800/10 to-black/10" />

      {/* Content */}
      <div className="relative z-10 mx-auto text-white">
        <h1
          className="text-4xl sm:text-6xl font-bold font-sans mb-6
                       text-transparent bg-clip-text bg-gradient-to-br from-white via-blue-400 to-blue-700"
        >
          Learn Smarter. <br />
          Build Real Skills. <br />
          Launch Your Tech Career.
        </h1>

        <p className="text-base sm:text-lg max-w-2xl leading-relaxed text-white/90 mb-8">
          Join a new-age learning platform designed for{" "}
          <strong>freshers, students, and passionate learners</strong> who want
          more than just certificates. Learn directly from{" "}
          <strong>top IIT-trained educators and industry experts</strong>, work
          on real-world projects, and gain the confidence to build, deploy, and
          succeed in today’s competitive tech landscape.
        </p>

        {/* Highlights */}
        <ul className="flex flex-wrap gap-4 text-sm sm:text-base mb-10">
          <li className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full">
            🚀 Career-Focused Learning
          </li>
          <li className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full">
            🧠 Beginner → Advanced Roadmaps
          </li>
          <li className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full">
            💻 Hands-on Projects
          </li>
          <li className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full">
            🎓 Mentorship from Experts
          </li>
        </ul>

        {/* CTA */}
        <div className="flex flex-wrap gap-4">
          <button
            className="px-6 py-3 rounded-xl bg-gray-300 text-black hover:text-white border border-gray-300 hover:bg-white/10 transition-all font-semibold"
            onClick={() =>
              document.getElementById("courses")?.scrollIntoView({
                behavior: "smooth",
              })
            }
          >
            Explore Courses
          </button>
        </div>
      </div>
    </section>
  );
};

export default ExpertProfessionals;
