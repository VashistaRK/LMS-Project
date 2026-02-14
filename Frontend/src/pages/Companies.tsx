import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthProvider";
import { Lock } from "lucide-react";
import { toast } from "sonner";

type Company = {
  name: string;
  slug: string;
  description?: string;
  years?: number[];
};

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const PAGE_SIZE = 24;
  const [currentPage, setCurrentPage] = useState(0);
  const navigate = useNavigate();

  const { user } = useAuthContext();
  const hasAccess = !!user?.accessGranted;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get("/api/companies");
        if (!cancelled) setCompanies(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Reset or clamp current page when companies change
  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(companies.length / PAGE_SIZE));
    if (currentPage >= totalPages) {
      setCurrentPage(totalPages - 1);
    }
  }, [companies, currentPage]);

  return (
    <div className="min-h-screen max-w-7xl mx-6 xl:mx-auto">
      {/* Header */}
      <div className="text-5xl py-12 md:py-26 font-bold leading-tight tracking-tight font-mulish">
        <h2 className="text-zinc-900 font-extrabold">Top Companies</h2>
        <p className="text-gray-500 font-bold">
          Browse leading organizations and discover self-training opportunities
          with previous year question papers.
        </p>
      </div>

      <div className="pb-32">
        <h2 className="text-xl font-mulish font-bold text-zinc-900 mb-4">
          Self-Training Guidance
        </h2>

        <p className="max-w-2xl text-sm sm:text-base font-semibold leading-relaxed text-zinc-500 tracking-tighter">
          Unlock your potential by leveraging the resources provided by these
          companies. Each organization offers unique programs, tools, or
          learning paths designed to help you excel. Explore company profiles to
          discover specific opportunities for growth, from free workshops to
          advanced mentorship.
        </p>
        <br />
        <p className="max-w-2xl text-sm sm:text-base font-semibold leading-relaxed text-zinc-500 tracking-tighter">
          Take charge of your professional journey by proactively seeking out
          trainings or certifications these companies support. Stay updated with
          the latest industry skills and boost your employability with
          structured self-paced learning from renowned institutions.
        </p>
      </div>
      <div
        className="relative rounded-2xl border-b bg-cover bg-center mb-8 before:absolute before:inset-0 before:bg-gray-100/10 before:backdrop-grayscale before:rounded-2xl"
        style={{
          backgroundImage: `url(images/men.jpg)`,
        }}
      >
        <div className="mx-auto relative z-10 font-mulish flex flex-col w-full px-6 py-12 md:pt-52 rounded-2xl">
          <h1 className="text-3xl md:text-6xl font-bold mb-2">
            Companies & Past Papers
          </h1>
        </div>
      </div>

      <div className="py-8">
        {/* Companies Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(() => {
            const start = currentPage * PAGE_SIZE;
            const paginated = companies.slice(start, start + PAGE_SIZE);
            const items: (Company | undefined)[] = loading
              ? new Array<Company | undefined>(PAGE_SIZE).fill(undefined)
              : paginated;
            return items.map((c, idx) => (
              <div
                key={c?.slug ?? `${currentPage}-${idx}`}
                className={`relative bg-white rounded-lg border border-b-4 p-6 transition-all
                  ${
                    hasAccess
                      ? "cursor-pointer border-b-blue-600 hover:border-blue-200 hover:bg-blue-50"
                      : "cursor-not-allowed opacity-80 border-b-gray-300"
                  }
                `}
                onClick={() => {
                  if (!c) return;

                  if (!hasAccess) {
                    toast.warning("Access should be granted by the admin");
                    return;
                  }

                  navigate(`/companies/${c.slug}`);
                }}
              >
                {!hasAccess && c && (
                  <div
                    className="absolute inset-0 bg-white/70 flex items-center justify-center
                  opacity-0 hover:opacity-100 transition"
                  >
                    <div className="flex items-center gap-2 text-gray-700 font-medium">
                      <Lock className="w-5 h-5" />
                      Locked
                    </div>
                  </div>
                )}
                {c ? (
                  <>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {c.name}
                    </h3>
                    {c.description && (
                      <p className="text-sm text-gray-600 mb-4">
                        {c.description}
                      </p>
                    )}

                    {c.years && c.years.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-2">
                          Available Years:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {c.years.map((y: number) => (
                            <span
                              key={y}
                              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-medium"
                            >
                              {y}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-3 border-t">
                      <span className="text-blue-600 text-sm font-medium flex items-center gap-1">
                        View Papers
                        <span>→</span>
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                  </div>
                )}
              </div>
            ));
          })()}
        </div>

        {/* Pagination Controls */}
        {!loading && companies.length > PAGE_SIZE && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {Math.min(companies.length, currentPage * PAGE_SIZE + 1)}{" "}
              - {Math.min(companies.length, (currentPage + 1) * PAGE_SIZE)} of{" "}
              {companies.length}
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1 bg-white border rounded disabled:opacity-50"
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
              >
                Prev
              </button>
              <div className="text-sm text-gray-700">
                Page {currentPage + 1} of{" "}
                {Math.max(1, Math.ceil(companies.length / PAGE_SIZE))}
              </div>
              <button
                className="px-3 py-1 bg-white border rounded disabled:opacity-50"
                onClick={() =>
                  setCurrentPage((p) =>
                    Math.min(
                      p + 1,
                      Math.ceil(companies.length / PAGE_SIZE) - 1,
                    ),
                  )
                }
                disabled={
                  currentPage >= Math.ceil(companies.length / PAGE_SIZE) - 1
                }
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && companies.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🏢</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              No Companies Available
            </h3>
            <p className="text-sm text-gray-600">
              Check back soon for company papers.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
