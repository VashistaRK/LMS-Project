/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/react/style.css";
import { BlockNoteView } from "@blocknote/mantine";
import { normalizeBlockNoteContent } from '../lib/notes';

export default function DocViewer({ docId }: { docId: string }) {
  const [loading, setLoading] = useState(true);
  const editor = useCreateBlockNote();
  const baseURL= import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await fetch(`${baseURL}/docs/${docId}`);
        const data = await res.json();
        if (data.content) {
          try {
            const blocks = normalizeBlockNoteContent(data.content);
            if (blocks) editor.replaceBlocks(editor.topLevelBlocks, blocks);
            else if (data.content) {
              console.warn('DocViewer: cannot normalize content', data.content);
              // attach fallback to editor container by setting a flag on window so UI can render it if needed
              (window as any).__docviewer_fallback_content = data;
            }
          } catch (err) {
            console.error('DocViewer: Failed to restore document content', err);
          }
        }
      } catch (err) {
        console.error("Error fetching document:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoc();
  }, [docId]);

  if (loading) return <p className="p-4 text-gray-500">Loading document...</p>;

  const fallbackData = (window as any).__docviewer_fallback_content as any | undefined;

  if (fallbackData && !normalizeBlockNoteContent(fallbackData.content)) {
    const api = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const downloadJson = () => {
      const dataStr = JSON.stringify(fallbackData.content ?? {}, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fallbackData.docId || docId}-content.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    const openPdf = () => {
      const pdfUrl = fallbackData.pdfUrl ?? '';
      const href = pdfUrl.startsWith('http') ? pdfUrl : `${api}${pdfUrl}`;
      window.open(href, '_blank');
    };

    return (
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
        <div className="p-6 border rounded-lg bg-yellow-50">
          <h4 className="font-semibold text-gray-800 mb-2">Rich content cannot be displayed</h4>
          <p className="text-sm text-gray-600 mb-4">You can download the raw content or open the PDF (if available).</p>
          <div className="flex gap-2">
            <button onClick={downloadJson} className="px-3 py-2 bg-blue-600 text-white rounded-lg">Download JSON</button>
            {fallbackData?.pdfUrl && (
              <button onClick={openPdf} className="px-3 py-2 bg-gray-700 text-white rounded-lg">Open PDF</button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
      <BlockNoteView editor={editor} editable={false} theme="light" />
    </div>
  );
}
