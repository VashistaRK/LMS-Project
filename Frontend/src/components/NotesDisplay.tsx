import { useState, useEffect } from 'react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';
import { FileText, Eye, BookOpen, AlertCircle } from 'lucide-react';
import { useDocument } from '../hooks/useNotes';
import PdfViewer from './PDFViewer';
// PDF will be displayed via iframe built from backend metadata
import type { Note } from '../services/notesApi';
import { normalizeBlockNoteContent } from '../lib/notes';

type DocData = {
  content?: unknown;
  // backend returns metadata but excludes binary pdfData from the /:id endpoint
  pdfData?: unknown;
  pdfGzipped?: boolean;
  pdfSize?: number;
  pdfPath?: string;
  pdfUrl?: string;
  docId?: string;
  notes?: unknown;
};

function isDocWithPdf(obj: unknown): obj is DocData {
  if (!obj || typeof obj !== 'object') return false;
  const o = obj as Record<string, unknown>;
  // Older responses may include pdfData; metadata responses include pdfSize/pdfGzipped
  return ('pdfData' in o && !!o.pdfData) || (typeof o.pdfSize === 'number' && o.pdfSize > 0) || Boolean(o.pdfGzipped);
}

interface NotesDisplayProps {
  notesId?: string;
  manualNotes?: Note[];
  className?: string;
}

export default function NotesDisplay({
  notesId,
  manualNotes = [],
  className = ""
}: NotesDisplayProps) {
  const [activeTab, setActiveTab] = useState<'manual' | 'rich' | 'pdf'>('manual');

  const editor = useCreateBlockNote();

  // Use React Query hook to fetch document data
  const { data: docData, isLoading: loading, error } = useDocument(notesId);
  // Track which docIds we've already warned about to avoid spamming console
  const warnedDocsRef = useState(() => new Set<string>())[0] as Set<string>;

  // Load rich text content when document data changes
  useEffect(() => {
    const blocks = normalizeBlockNoteContent(docData?.content);
    if (blocks) {
      try {
        editor.replaceBlocks(editor.document, blocks);
      } catch (err) {
        console.error('NotesDisplay: failed to load BlockNote blocks', err);
      }
    } else if (docData?.content) {
      const id = docData?.docId || notesId || 'unknown';
      if (!warnedDocsRef.has(id)) {
        warnedDocsRef.add(id);
        console.warn('NotesDisplay: content present but could not be normalized for BlockNote', { id, content: docData.content });
      }
    }

    // Determine active tab based on available content
    // backend returns PDF metadata (pdfSize/pdfGzipped) but excludes the binary buffer
    if (isDocWithPdf(docData)) {
      setActiveTab('pdf');
    } else if (docData?.content) {
      setActiveTab('rich');
    } else {
      setActiveTab('manual');
    }
  }, [docData, editor, notesId, warnedDocsRef]);

  // Determine which notes to display
  const displayNotes = (docData && Array.isArray(docData.notes) && docData.notes.length > 0) ? docData.notes : manualNotes;
  const hasRichContent = !!(docData && 'content' in docData && (docData as DocData).content);
  // PDF content is available if backend indicates path/pdfUrl or size/gzipped flag
  const hasPdfContent = !!(
    docData && (
      ((): string | false => {
        const d: unknown = docData;
        try {
          const asObj = d as Record<string, unknown>;
          if (typeof asObj.pdfUrl === 'string') return asObj.pdfUrl as string;
          if (typeof asObj.pdfPath === 'string') return asObj.pdfPath as string;
        } catch {
          // ignore
        }
        return isDocWithPdf(docData) ? '1' : false;
      })()
    )
  );

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 bg-gray-50 rounded-lg ${className}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading notes...</p>
        </div>
      </div>
    );
  }

  if (error && !displayNotes.length && !hasRichContent && !hasPdfContent) {
    return (
      <div className={`flex items-center justify-center p-8 bg-gray-50 rounded-lg ${className}`}>
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No notes available for this chapter</p>
          <p className="text-sm text-gray-500">Notes will appear here once the instructor adds them</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg gap-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Chapter Notes</h3>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-1 bg-white rounded-lg p-1 border w-full sm:w-auto">
          {displayNotes.length > 0 && (
            <button
              onClick={() => setActiveTab('manual')}
              className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md transition-colors flex items-center gap-1 ${activeTab === 'manual'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Text Notes</span>
              <span className="sm:hidden">Text</span>
            </button>
          )}

          {hasRichContent && (
            <button
              onClick={() => setActiveTab('rich')}
              className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md transition-colors flex items-center gap-1 ${activeTab === 'rich'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Rich Text</span>
              <span className="sm:hidden">Rich</span>
            </button>
          )}

          {hasPdfContent && (
            <button
              onClick={() => setActiveTab('pdf')}
              className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md transition-colors flex items-center gap-1 ${activeTab === 'pdf'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">PDF Document</span>
              <span className="sm:hidden">PDF</span>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'manual' && displayNotes.length > 0 && (
          <div className="space-y-4">
            {displayNotes.map((note: Note, index: number) => (
              <div
                key={index}
                className="border-l-4 border-blue-400 bg-blue-50 p-4 rounded-r-lg"
              >
                {note.heading && (
                  <h4 className="font-semibold text-gray-900 mb-2 text-lg">
                    {note.heading}
                  </h4>
                )}
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {note.content}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'rich' && hasRichContent && (
          (() => {
            const blocks = normalizeBlockNoteContent(docData?.content);
            if (blocks) {
              return (
                <div className="border rounded-lg overflow-hidden">
                  <BlockNoteView
                    editor={editor}
                    editable={false}
                    theme="light"
                    className="min-h-[400px]"
                  />
                </div>
              );
            }

            // Fallback UI when content cannot be displayed
            const api = import.meta.env.VITE_API_URL || 'http://localhost:3000';

            const downloadJson = () => {
              const dataStr = JSON.stringify(docData?.content ?? {}, null, 2);
              const blob = new Blob([dataStr], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${docData?.docId || notesId || 'notes'}-content.json`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            };

            const downloadPdf = () => {
              const id = docData?.docId ?? notesId ?? '';
              if (!id) return;
              const href = id.startsWith('http') ? id : `${api}/docs/${id}/pdf`;
              window.open(href, '_blank');
            };

            return (
              <div className="p-6 border rounded-lg bg-yellow-50">
                <h4 className="font-semibold text-gray-800 mb-2">Rich content cannot be displayed</h4>
                <p className="text-sm text-gray-600 mb-4">This document contains rich content that the viewer couldn't render. You can download the raw content or the PDF (if available).</p>
                <div className="flex gap-2">
                  <button onClick={downloadJson} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Download JSON</button>
                  {docData?.pdfUrl && (
                    <button onClick={downloadPdf} className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800">Open PDF</button>
                  )}
                </div>
              </div>
            );
          })()
        )}

        {activeTab === 'pdf' && hasPdfContent && (
          <div>
            <PdfViewer
              docId={((docData as DocData)?.docId ?? notesId ?? '')}
              className="min-h-[700px]"
              height={800}
            />
          </div>
        )}



        {/* Empty state for manual notes */}
        {activeTab === 'manual' && displayNotes.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-600 mb-2">No Text Notes</h4>
            <p className="text-gray-500">No manual notes available for this chapter</p>
          </div>
        )}
      </div>
    </div>
  );
}
