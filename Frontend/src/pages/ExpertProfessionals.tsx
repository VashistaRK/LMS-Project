const ExpertProfessionals = () => {
  return (
    <section className="max-w-6xl mx-auto bg-red-100/60 p-6 sm:p-10 rounded-3xl">
      {/* Heading */}
      <h1 className="text-3xl sm:text-5xl font-bold mb-6">
        Seamless Online <br />
        Learning For All <br />
        From Top IIT Professors
      </h1>

      {/* Content Section */}
      <div className="mt-10 flex flex-col md:flex-row items-center md:items-end justify-between gap-8">
        
        {/* Image */}
        <img
          src="images/bg.jpg"
          alt="Expert Professors"
          className="w-full max-w-sm md:max-w-md h-auto rounded-2xl object-cover"
        />

        {/* Text */}
        <p className="text-base sm:text-lg max-w-xl leading-relaxed">
          Discover trending courses you can trust and master the most in-demand
          skills like Tableau, Azure, Data Science, Full Stack Development, and
          more. Whether you’re a beginner or aiming to advance your expertise,
          our programs take you from beginner to intermediate to advanced levels
          with project-based learning to help you build real-world products.
        </p>
      </div>
    </section>
  );
};

export default ExpertProfessionals;
