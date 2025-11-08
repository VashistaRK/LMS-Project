import { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

type Company = { name: string; slug: string; description?: string; years?: number[] };

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get('/api/companies');
        if (!cancelled) setCompanies(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#C21817] to-[#A51515] text-white text-center border-b">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <h1 className="text-3xl font-bold mb-2">Companies & Past Papers</h1>
          <p className="">Browse companies and access previous year question papers</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Companies Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(() => {
            const items: (Company | undefined)[] = loading ? new Array<Company | undefined>(6).fill(undefined) : companies;
            return items.map((c, idx) => (
              <div 
                key={c?.slug ?? idx} 
                className="bg-white rounded-lg border p-6 hover:border-red-200 hover:bg-red-50 transition-all cursor-pointer"
                onClick={() => c?.slug && navigate(`/companies/${c.slug}`)}
              >
                {c ? (
                  <>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{c.name}</h3>
                    {c.description && (
                      <p className="text-sm text-gray-600 mb-4">{c.description}</p>
                    )}
                    
                    {c.years && c.years.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-2">Available Years:</p>
                        <div className="flex flex-wrap gap-2">
                          {c.years.map((y: number) => (
                            <span key={y} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-medium">
                              {y}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-3 border-t">
                      <span className="text-red-600 text-sm font-medium flex items-center gap-1">
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

        {/* Empty State */}
        {!loading && companies.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🏢</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No Companies Available</h3>
            <p className="text-sm text-gray-600">Check back soon for company papers.</p>
          </div>
        )}
      </div>
    </div>
  );
}