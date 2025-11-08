/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import "@blocknote/core/fonts/inter.css";
import { useEffect } from "react";
import { toast } from "sonner";
import { normalizeBlockNoteContent } from '../../lib/notes';

interface MyEditorProps {
  docId: string;
}

export default function MyEditor({ docId }: MyEditorProps) {
  const editor = useCreateBlockNote();

  const api = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // ✅ Load doc content if it exists
  useEffect(() => {
    if (!docId) return;

    const loadDocument = async () => {
      try {
        const res = await fetch(`${api}/docs/${docId}`);
        
        if (res.ok) {
          const data = await res.json();
          if (data?.content) {
            try {
              const blocks = normalizeBlockNoteContent(data.content);
              if (blocks) {
                editor.replaceBlocks(editor.document, blocks);
              } else if (data.content) {
                console.warn('Doceditor: could not normalize content', data.content);
                (window as any).__doceditor_fallback_content = data;
              }
            } catch (err) {
              console.error('Error restoring document in Doceditor', err);
              toast.error('Failed to load document content');
            }
          }
        } else {
          console.log("New document - nothing to load yet");
        }
      } catch (error) {
        console.error("Error loading document:", error);
        toast.error("Failed to load document");
      }
    };

    loadDocument();
  }, [docId, api]);

  const handleSave = async () => {
    if (!docId) {
      toast.error("Document ID is missing!");
      return;
    }

    try {
      const content = editor.document;

      // 🔑 Try to update first (PUT)
      const res = await fetch(`${api}/docs/${docId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (res.status === 404) {
        // If not found, create a new doc (POST)
        const createRes = await fetch(`${api}/docs/${docId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        });

        if (createRes.ok) {
          toast.success("Document created and saved!");
        } else {
          throw new Error("Failed to create document");
        }
      } else if (res.ok) {
        toast.success("Document saved successfully!");
      } else {
        throw new Error("Failed to save document");
      }
    } catch (error) {
      console.error("Error saving document:", error);
      toast.error("Failed to save document");
    }
  };

  return (
    <div className="w-full flex flex-col">
      <div className="flex justify-between items-center mb-3">
        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded font-mono">
          Doc ID: {docId}
        </div>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-gradient-to-r from-[#C21817] to-[#A51515] text-white rounded-lg hover:opacity-95 transition-colors font-medium shadow-sm"
        >
          💾 Save Notes
        </button>
      </div>
      <div className="flex-1 border rounded-lg overflow-hidden">
        {/* If fallback present and cannot normalize, show download UI */}
        {(() => {
          const fallback = (window as any).__doceditor_fallback_content as any | undefined;
          if (fallback && !normalizeBlockNoteContent(fallback.content)) {
            const api = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const downloadJson = () => {
              const dataStr = JSON.stringify(fallback.content ?? {}, null, 2);
              const blob = new Blob([dataStr], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${fallback.docId || docId}-content.json`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            };
            const openPdf = () => {
              const pdfUrl = fallback.pdfUrl ?? '';
              const href = pdfUrl.startsWith('http') ? pdfUrl : `${api}${pdfUrl}`;
              window.open(href, '_blank');
            };

            return (
              <div className="p-6 border rounded-lg bg-yellow-50">
                <h4 className="font-semibold text-gray-800 mb-2">Rich content cannot be displayed</h4>
                <p className="text-sm text-gray-600 mb-4">Download the raw content or open the PDF (if available).</p>
                <div className="flex gap-2">
                  <button onClick={downloadJson} className="px-3 py-2 bg-gradient-to-r from-[#C21817] to-[#A51515] text-white rounded-lg">Download JSON</button>
                  {fallback?.pdfUrl && (
                    <button onClick={openPdf} className="px-3 py-2 bg-gray-700 text-white rounded-lg">Open PDF</button>
                  )}
                </div>
              </div>
            );
          }

          return <BlockNoteView editor={editor} />;
        })()}
      </div>
    </div>
  );
}
