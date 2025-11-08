import { careers } from "../data/Careers_data";

export default function Career() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#fff6f6] to-white text-gray-900 p-10">
      {/* Header */}
      <header className="text-center mb-12">
        <h1 className="text-6xl font-extrabold text-[#C21817]">
          Ready To Redesign Your Career?
        </h1>
        <h2 className="text-4xl font-bold text-[#A51515] mt-5">
          Career Accelerators
        </h2>
        <p className="mt-4 text-lg text-gray-600">
          Explore different career paths in Software and accelerate your journey
          with the right choice.
        </p>
      </header>

      {/* Career Cards */}
      <section className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {careers.map((career, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition duration-300"
          >
            <img
              src={career.img}
              alt={career.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h2 className="text-xl font-semibold text-[#A51515] mb-2">
                {career.title}
              </h2>
              <p className="text-gray-600 text-sm">{career.description}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
