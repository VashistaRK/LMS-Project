import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div
        className="text-white border-b bg-cover bg-center mb-8"
        style={{
          backgroundImage: `url(images/abstract_interview_preparation_concept.png)`,
        }}
      >
        <div className="mx-auto px-6 py-12 md:py-24 bg-gradient-to-r from-black/50 via-black/0 to-black/0">
          <h1 className="text-3xl md:text-6xl max-w-xl font-bold font-sans mb-2">
            Companies & Past Papers
          </h1>
          <p className="text-lg">
            Browse companies and access previous year question papers
          </p>
        </div>
      </div>

      <div className="max-w-[85rem] mx-auto px-6 py-8">
        {/* Companies Grid */}
        <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {(() => {
            const start = currentPage * PAGE_SIZE;
            const paginated = companies.slice(start, start + PAGE_SIZE);
            const items: (Company | undefined)[] = loading
              ? new Array<Company | undefined>(PAGE_SIZE).fill(undefined)
              : paginated;
            return items.map((c, idx) => (
              <div
                key={c?.slug ?? `${currentPage}-${idx}`}
                className="bg-white rounded-lg border border-b-4 border-b-blue-600 p-6 hover:border-blue-200 hover:bg-blue-50 transition-all cursor-pointer"
                onClick={() => c?.slug && navigate(`/companies/${c.slug}`)}
              >
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
                    Math.min(p + 1, Math.ceil(companies.length / PAGE_SIZE) - 1)
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
