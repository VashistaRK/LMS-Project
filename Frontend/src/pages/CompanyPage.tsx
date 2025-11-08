/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

type Paper = { _id?: string; title: string; year: number; file?: { filename?: string } };
type CompanyType = { name: string; description?: string; guidance?: string; papers?: Paper[]; tests?: any[] };
const baseURL= import.meta.env.VITE_API_URL;

function PDFViewer({ pdfUrl, showControls = true, className, style }: { pdfUrl: string; showControls?: boolean; className?: string; style?: React.CSSProperties }) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState<number | 'fit'>(1);

  useEffect(() => {
    if (!pdfUrl) {
      setBlobUrl(null);
      setError(null);
      return;
    }

    const ac = new AbortController();
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(pdfUrl, { credentials: "include", signal: ac.signal });
        if (!res.ok) throw new Error(`Failed to load PDF (${res.status})`);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
      } catch (err: any) {
        if (err.name === "AbortError") return;
        console.error("PDF fetch error:", err);
        setError(err?.message || "Failed to load PDF");
        setBlobUrl(null);
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      ac.abort();
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        setBlobUrl(null);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfUrl]);

  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  const downloadUrl = useMemo(() => blobUrl ?? pdfUrl, [blobUrl, pdfUrl]);

  return (
    <div className={className} style={{ ...style }}>
      {showControls && (
        <div className="flex items-center gap-2 mb-2" style={{ marginBottom: 8 }}>
          <div className="flex items-center gap-1">
            <button
              className="px-3 py-1 border rounded bg-white"
              onClick={() => setScale((s) => (s === 'fit' ? 0.75 : Math.max(0.3, +(Number(s) - 0.25).toFixed(2))))}
              title="Zoom out"
            >
              −
            </button>
            <div className="px-3 py-1 border rounded text-sm bg-white">Zoom: {(typeof scale === 'number' ? (scale * 100).toFixed(0) : 'Fit')}</div>
            <button
              className="px-3 py-1 border rounded bg-white"
              onClick={() => setScale((s) => (s === 'fit' ? 1.25 : +(Number(s) + 0.25).toFixed(2)))}
              title="Zoom in"
            >
              +
            </button>
            <button
              className="px-3 py-1 border rounded bg-white"
              onClick={() => setScale(1)}
              title="Reset zoom"
            >
              100%
            </button>
            <button
              className="px-3 py-1 border rounded bg-white"
              onClick={() => setScale('fit')}
              title="Fit width"
            >
              Fit
            </button>
          </div>

          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <a
              href={downloadUrl}
              target="_blank"
              rel="noreferrer"
              download
              className="px-3 py-1 border rounded bg-white text-sm"
            >
              Download
            </a>
            <a
              href={downloadUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1 border rounded bg-white text-sm"
            >
              Open
            </a>
          </div>
        </div>
      )}

      <div style={{ position: "relative", width: "100%", minHeight: 300, borderRadius: 6, overflow: "hidden", border: "1px solid #e5e7eb" }}>
        {loading && (
          <div style={{ padding: 20, textAlign: "center", color: "#374151" }}>Loading PDF…</div>
        )}

        {error && (
          <div style={{ padding: 20, textAlign: "center", color: "#b91c1c" }}>{error}</div>
        )}

        {!loading && !error && (
          <>
            {(() => {
              if (!blobUrl && !pdfUrl) {
                return <div style={{ padding: 20, textAlign: "center", color: "#6b7280" }}>No document</div>;
              }

              const src = blobUrl ?? pdfUrl;
              const isFit = scale === 'fit';
              // wrapper and iframe styles
              const wrapperStyle: React.CSSProperties = { width: "100%", height: 720, overflow: "auto" };
              const iframeStyle: React.CSSProperties = isFit
                ? { width: "100%", height: "100%", border: "none" }
                : { width: "100%", height: "100%", border: "none", transform: `scale(${typeof scale === 'number' ? scale : 1})`, transformOrigin: "top left" };

              return (
                <div style={wrapperStyle}>
                  <iframe
                    title="PDF Viewer"
                    src={src}
                    style={iframeStyle}
                    sandbox="allow-same-origin allow-scripts allow-forms"
                  />
                </div>
              );
            })()}
          </>
        )}
      </div>
    </div>
  );
}

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
        const res = await api.get(`/api/companies/${encodeURIComponent(slug)}`);
        if (cancelled) return;
        // normalize response: api wrapper may return { data } or raw company
        const data = res && (res.data ?? res);
        setCompany(data || null);
      } catch (err) {
        console.error('Failed to load company', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
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
            {[1, 2, 3].map(i => (
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
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🏢</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Company Not Found</h3>
          <p className="text-gray-600 text-sm">The company you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  // group papers by year (paper.year should exist)
  const papers = (company.papers || []).map(p => ({
    _id: p._id ?? (p as any).docId ?? '',
    title: p.title ?? 'Untitled',
    year: p.year ?? 0,
    filename: p.file?.filename ?? ''
  }));

  const papersByYear = papers.reduce((acc: Record<string, typeof papers[0][]>, p) => {
    const key = p.year ? String(p.year) : 'Unknown';
    acc[key] = acc[key] || [];
    acc[key].push(p);
    return acc;
  }, {} as Record<string, typeof papers[0][]>);

  const sortedYears = Object.keys(papersByYear).sort((a, b) => Number(b) - Number(a));

  const makeDownloadUrl = (paperId: string) => `${baseURL}/api/companies/${encodeURIComponent(slug || '')}/papers/${encodeURIComponent(paperId)}/download`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{company.name}</h1>
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
              <span className="text-red-600">📋</span>
              Preparation Guidance
            </h2>
            <div
              className="prose prose-sm max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: company.guidance }}
            />
          </div>
        )}

        {/* Tests */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Company Tests</h2>
              <p className="text-sm text-gray-600">Attempt company specific tests created by admin</p>
            </div>
          </div>

          {(company.tests || []).length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-500">No tests available for this company.</div>
          ) : (
            <div className="space-y-3">
              {(company.tests || []).map((t: any) => (
                <div key={t.testId} className="flex items-center justify-between gap-4 p-4 rounded-lg border hover:border-red-200 hover:bg-red-50 transition-all">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900">{t.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{t.testId} • { (t.sections || []).map((s:any)=>`${s.key}:${(s.questionIds||[]).length}`).join(' • ') }</p>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/companies/${encodeURIComponent(slug || '')}/tests/${encodeURIComponent(t.testId)}`} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">Take Test</Link>
                    <Link to={`/admin/companies/${encodeURIComponent(slug || '')}/tests`} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">View</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Papers */}
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Previous Year Papers</h2>
            <p className="text-sm text-gray-600">Access and practice with question papers</p>
          </div>

          {sortedYears.length > 0 ? (
            <div className="space-y-6">
              {sortedYears.map(year => (
                <div key={year} className="bg-white rounded-lg border">
                  <div className="px-6 py-4 border-b bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <span className="text-red-600">{year}</span>
                      Papers
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-3">
                      {papersByYear[year].map((p) => {
                        const pid = p._id || '';
                        return (
                          <div
                            key={pid || p.title}
                            className="flex items-center justify-between gap-4 p-4 rounded-lg border hover:border-red-200 hover:bg-red-50 transition-all"
                          >
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 mb-1">{p.title}</h4>
                              <p className="text-xs text-gray-500">File: {p.filename || 'document'} • ID: {pid}</p>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                              {pid ? (
                                <>
                                  <a
                                    className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors"
                                    href={makeDownloadUrl(pid)}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    Download
                                  </a>
                                  <button
                                    onClick={() => setSelectedPaperId(pid)}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                                  >
                                    Preview
                                  </button>
                                </>
                              ) : (
                                <div className="text-sm text-gray-500">Unavailable</div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📄</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No Papers Available</h3>
              <p className="text-sm text-gray-600">Check back soon for previous year papers.</p>
            </div>
          )}
        </div>

        {/* PDF Preview */}
        {selectedPaperId && (
          <div className="mt-8 bg-white rounded-lg border">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Document Preview</h3>
              <div>
                <a
                  className="mr-2 text-sm text-gray-600 underline"
                  href={makeDownloadUrl(selectedPaperId)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open original
                </a>
                <button
                  onClick={() => setSelectedPaperId(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="p-6">
              <PDFViewer pdfUrl={makeDownloadUrl(selectedPaperId)} showControls />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}