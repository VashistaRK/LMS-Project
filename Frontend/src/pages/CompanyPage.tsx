/* eslint-disable */
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import DOMPurify from "dompurify";
import { LightGlassBg } from "@/components/ui/light-glass-bg";

/* --- types --- */
type Paper = {
  _id?: string;
  title: string;
  year: number;
  file?: { filename?: string };
};
type CompanyType = {
  name: string;
  description?: string;
  guidance?: string;
  papers?: Paper[];
  tests?: any[];
};

/* --- PDF viewer component (kept but small improvements) --- */
function PDFViewer({ pdfUrl }: { pdfUrl: string }) {
  const [finalUrl, setFinalUrl] = useState<string>("");

  useEffect(() => {
    if (!pdfUrl) {
      setFinalUrl("");
      return;
    }

    // Case 1: Base64 PDF (data URL)
    if (pdfUrl.startsWith("data:")) {
      setFinalUrl(pdfUrl + "#toolbar=0&navpanes=0&scrollbar=0");
      return;
    }

    // Case 2: Remote PDF → convert to Blob
    let objectUrl: string | null = null;

    const loadPDF = async () => {
      try {
        const res = await fetch(pdfUrl, { credentials: "include" });
        const blob = await res.blob();
        objectUrl = URL.createObjectURL(blob);
        setFinalUrl(objectUrl);
      } catch (e) {
        console.error("PDF load error", e);
      }
    };

    loadPDF();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [pdfUrl]);

  if (!finalUrl) {
    return <div className="p-4 text-gray-500">No document</div>;
  }

  return (
    <div
      className="w-full overflow-auto border rounded-lg"
      style={{ height: "720px" }}
    >
      <embed src={finalUrl} type="application/pdf" width="100%" height="100%" />
    </div>
  );
}

/* --- Main Page --- */
export default function CompanyPage() {
  const { slug } = useParams<{ slug: string }>();
  const [company, setCompany] = useState<CompanyType | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPaperId, setSelectedPaperId] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    (async () => {
      try {
        // use the same api wrapper you use elsewhere
        const res = await api.get(`/api/companies/${encodeURIComponent(slug)}`);
        if (cancelled) return;
        const data = res && (res.data ?? res);
        setCompany(data || null);
      } catch (err) {
        console.error("Failed to load company", err);
        setCompany(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-5xl mx-auto px-6 py-12">
            <div className="h-8 bg-gray-200 rounded animate-pulse w-64 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-96"></div>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg p-6 border">
                <div className="h-5 bg-gray-200 rounded animate-pulse w-32 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🏢</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Company Not Found
          </h3>
          <p className="text-gray-600 text-sm">
            The company you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  const papers = (company.papers || []).map((p: any) => ({
    _id: p._id,
    title: p.title,
    year: p.year,
    base64: p?.file?.data ? p.file.data.toString("base64") : null,
    contentType: p?.file?.contentType || "application/pdf",
    filename: p?.file?.filename || "paper.pdf",
  }));

  const papersByYear = papers.reduce(
    (acc: Record<string, (typeof papers)[0][]>, p) => {
      const key = p.year ? String(p.year) : "Unknown";
      acc[key] = acc[key] || [];
      acc[key].push(p);
      return acc;
    },
    {} as Record<string, (typeof papers)[0][]>
  );

  const sortedYears = Object.keys(papersByYear).sort(
    (a, b) => Number(b) - Number(a)
  );

  return (
    <LightGlassBg className="text-zinc-900">
    <div className="relative z-10 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {company.name}
          </h1>
          {company.description && (
            <p className="text-gray-600">{company.description}</p>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Guidance */}
        {company.guidance && (
          <div className="mb-8 bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-blue-600">📋</span>
              Preparation Guidance
            </h2>
            <div
              className="prose prose-sm max-w-none text-gray-700"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(company.guidance, {
                  ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "a", "ul", "ol", "li", "h1", "h2", "h3", "h4", "blockquote", "code", "pre"],
                  ALLOWED_ATTR: ["href", "target", "rel"],
                  ALLOW_DATA_ATTR: false,
                }),
              }}
            />
          </div>
        )}

        {/* Tests */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Company Tests
              </h2>
              <p className="text-sm text-gray-600">
                Attempt company specific tests created by admin
              </p>
            </div>
          </div>

          {(company.tests || []).length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-500">
              No tests available for this company.
            </div>
          ) : (
            <div className="space-y-3">
              {(company.tests || []).map((t: any) => (
                <div
                  key={t.testId}
                  className="flex items-center justify-between gap-4 p-4 rounded-lg border hover:border-blue-200 hover:bg-blue-50 transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900">{t.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {t.testId} •{" "}
                      {(t.sections || [])
                        .map((s: any) =>
                          `${s.key}:${
                            (s.questionIds || []).length
                          }`.toUpperCase()
                        )
                        .join(" • ")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/companies/${encodeURIComponent(
                        slug || ""
                      )}/tests/${encodeURIComponent(t.testId)}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                      Take Test
                    </Link>
                    <Link
                      to={`/admin/companies/${encodeURIComponent(
                        slug || ""
                      )}/tests`}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Papers */}
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">
              Previous Year Papers
            </h2>
            <p className="text-sm text-gray-600">
              Access and practice with question papers
            </p>
          </div>

          {sortedYears.length > 0 ? (
            <div className="space-y-6">
              {sortedYears.map((year) => (
                <div key={year} className="bg-white rounded-lg border">
                  <div className="px-6 py-4 border-b bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <span className="text-blue-600">{year}</span>
                      Papers
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-3">
                      {papersByYear[year].map((p) => (
                        <div
                          key={p._id}
                          className="flex items-center justify-between gap-4 p-4 rounded-lg border hover:border-blue-200 hover:bg-blue-50 transition-all"
                        >
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 mb-1">
                              {p.title}
                            </h4>
                            <p className="text-xs text-gray-500">
                              File: {p.filename}
                            </p>
                          </div>

                          <div className="flex gap-2">
                            {/* --- DOWNLOAD (base64) --- */}
                            {p.base64 ? (
                              <a
                                href={`data:${p.contentType};base64,${p.base64}`}
                                download={p.filename}
                                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200"
                              >
                                Download
                              </a>
                            ) : (
                              <span className="text-gray-500 text-sm">
                                Unavailable
                              </span>
                            )}

                            {/* --- PREVIEW IN IFRAME --- */}
                            {p.base64 && (
                              <button
                                onClick={() =>
                                  setSelectedPaperId(
                                    `data:${p.contentType};base64,${p.base64}`
                                  )
                                }
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                              >
                                Preview
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📄</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                No Papers Available
              </h3>
              <p className="text-sm text-gray-600">
                Check back soon for previous year papers.
              </p>
            </div>
          )}
        </div>

        {/* PDF Preview */}
        {selectedPaperId && (
          <div className="mt-8 bg-white rounded-lg border">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Document Preview
              </h3>
              <div>
                <button
                  onClick={() => setSelectedPaperId(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="p-6">
              <PDFViewer pdfUrl={selectedPaperId || ""} />
            </div>
          </div>
        )}
      </div>
    </div>
    </LightGlassBg>
  );
}
