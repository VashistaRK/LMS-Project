import { ArrowUpRight } from "lucide-react";

const ExpertProfessionals = () => {
  return (
    <section className="relative rounded-2xl w-full sm:py-12">
      <a href="/my-learning">
        <button className="cursor-pointer flex font-bold items-center gap-2 text-sm border-b-2 border-black  ">
          My Learnings
          <ArrowUpRight />
        </button>
      </a>
      {/* Content */}
      <div className="">
        <h1
          className="text-4xl sm:text-6xl font-extrabold font-mulish mb-26 md:mb-32
                    tracking-tight leading-tight"
        >
          Learn Smarter. <br />
          <p className="text-zinc-500">
            Build Real Skills. Launch Your Tech Career.
          </p>
        </h1>

        <h4 className="text-lg sm:text-xl max-w-2xl font-bold leading-relaxed mb-6 uppercase">
          The world will ask who you are, and if you do not know, the world will
          tell you.
        </h4>

        <p className="text-base sm:text-lg max-w-2xl leading-relaxed">
          Join a new-age learning platform designed for{" "}
          <span className="underline">
            freshers, students, and passionate learners
          </span>{" "}
          who want more than just certificates. Learn directly from{" "}
          <span className="underline">
            top IIT-trained educators and industry experts
          </span>
          , work on real-world projects, and gain the confidence to build,
          deploy, and succeed in today’s competitive tech landscape.
        </p>

        <img
          src="/assets/bg.jpg"
          alt=""
          className="ml-auto w-full mt-8 rounded-xl"
        />
      </div>
    </section>
  );
};

export default ExpertProfessionals;
