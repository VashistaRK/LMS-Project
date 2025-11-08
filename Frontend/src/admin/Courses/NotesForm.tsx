import { useState, useEffect, useRef } from "react";
import { FileText, Upload, X, Plus, Save, Trash2, Eye } from "lucide-react";
import type { Note } from "../../services/notesApi";
import { notesAPI } from "../../services/notesApi";

interface NotesFormProps {
  initialNotes: Note[];
  onSave: (notes: Note[]) => void;
  notesId?: string; // Used for PDF association
}

export default function NotesForm({ initialNotes, onSave, notesId }: NotesFormProps) {
  const [notes, setNotes] = useState<Note[]>(
    initialNotes.length > 0
      ? initialNotes
      : [{ heading: "", content: "", type: "text" }]
  );
  const [pdf, setPdf] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploadedDocId, setUploadedDocId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 🧠 Handle text note change (only heading/content are edited here)
  const handleChange = (index: number, field: 'heading' | 'content', value: string) => {
    const updated = [...notes];
    updated[index] = { ...updated[index], [field]: value } as Note;
    setNotes(updated);
  };

  // ➕ Add a new note
  const addNote = () => {
    setNotes([...notes, { heading: "", content: "", type: "text" }]);
  };

  // ❌ Remove note
  const removeNote = (index: number) => {
    if (notes.length > 1) {
      setNotes(notes.filter((_, i) => i !== index));
    }
  };

  // 💾 Save notes manually
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const validNotes = notes.filter((note) => note.content.trim());
    try {
      // Placeholder for API logic — currently just sends notes to parent
      onSave(validNotes);
    } catch (error) {
      console.error("Error saving notes:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // 📤 Upload PDF
  const handleUploadPdf = async () => {
  if (!pdf) return alert("Please select a PDF first.");
  if (!notesId) return alert('Missing notesId for this upload');

  setIsUploading(true);
  try {
    const result = await notesAPI.uploadPDF(notesId, pdf);

    // result contains { pdfUrl, fileSize, docId }
    setUploadedDocId(result.docId);
    // show link to the uploaded PDF
    setPreviewUrl(result.pdfUrl);
    alert('✅ PDF uploaded successfully!');
    // clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  } catch (err) {
    console.error('❌ Upload error:', err);
    alert(err instanceof Error ? err.message : 'Failed to upload PDF');
  } finally {
    setIsUploading(false);
  }
};


  // 👁 Preview selected PDF locally
  const handlePreviewPdf = () => {
    if (pdf) {
      const url = URL.createObjectURL(pdf);
      setPreviewUrl(url);
    }
  };

  // 🧹 Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Chapter Notes
          </h2>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={addNote}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Note
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save Notes"}
            </button>
          </div>
        </div>

        {/* PDF Upload Section */}
        {notesId && (
          <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 space-y-4">
            <div className="text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Upload PDF Notes
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Upload a PDF file (max 10MB)
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={(e) => setPdf(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />

              {pdf && (
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handlePreviewPdf}
                    className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </button>
                  <button
                    type="button"
                    onClick={handleUploadPdf}
                    disabled={isUploading || !pdf}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    {isUploading ? "Uploading..." : "Upload PDF"}
                  </button>
                </div>
              )}
            </div>

            {pdf && (
              <div className="text-sm text-gray-600">
                <p><strong>File:</strong> {pdf.name}</p>
                <p><strong>Size:</strong> {(pdf.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            )}

            {uploadedDocId && (
              <div className="text-sm text-green-700 mt-2">
                ✅ Uploaded successfully.{" "}
                <a
                  href={`http://localhost:5000/api/docs/view/${uploadedDocId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-blue-600"
                >
                  View PDF
                </a>
              </div>
            )}
          </div>
        )}

        {/* PDF Preview Modal */}
        {previewUrl && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">PDF Preview</h3>
                <button
                  onClick={() => setPreviewUrl("")}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-4">
                <iframe
                  src={previewUrl}
                  className="w-full h-[70vh] border rounded"
                  title="PDF Preview"
                />
              </div>
            </div>
          </div>
        )}

        {/* Manual Notes Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-700">Manual Notes</h3>
          {notes.map((note, index) => (
            <div
              key={index}
              className="p-6 border rounded-lg bg-white shadow-sm space-y-4 relative"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">
                  Note {index + 1}
                </span>
                {notes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeNote(index)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    title="Remove note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heading (Optional)
                </label>
                <input
                  type="text"
                  value={note.heading || ""}
                  onChange={(e) => handleChange(index, "heading", e.target.value)}
                  placeholder="Enter note heading"
                  maxLength={100}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <textarea
                  value={note.content}
                  onChange={(e) => handleChange(index, "content", e.target.value)}
                  placeholder="Enter note content"
                  rows={4}
                  maxLength={5000}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                />
              </div>
            </div>
          ))}
        </div>
      </form>
    </div>
  );
}
