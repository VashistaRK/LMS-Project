import React from "react";

interface PdfViewerProps {
  docId: string;
  className?: string;
  height?: string | number;
}

// Minimal embed-based PDF viewer. Renders a section with an <embed> pointing to the
// backend PDF endpoint: /docs/:docId/pdf. This keeps things simple and avoids
// pdf.js worker/CORS issues by using the browser's native PDF rendering.
const PdfViewer: React.FC<PdfViewerProps> = ({ docId, className = "", height = 800 }) => {
  const BACKEND_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:3000";

  const src = docId
    ? `${BACKEND_URL}/docs/${encodeURIComponent(docId)}/pdf#toolbar=0&navpanes=0`
    : "";

  if (!docId) {
    return <div className={className}>No document specified.</div>;
  }

  return (
    <section className={`border rounded overflow-hidden ${className}`}>
      <embed src={src} type="application/pdf" width="100%" height={typeof height === 'number' ? `${height}px` : height} />
    </section>
  );
};

export default PdfViewer;
