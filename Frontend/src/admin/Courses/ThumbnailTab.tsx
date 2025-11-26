
import { useState, useRef, useEffect } from "react";
import { coursesApi } from "../../services/GlobalApi";
import { useParams } from "react-router";
import { Upload, Loader2, Pencil } from "lucide-react";
import getThumbnailUrl from "../../utils/getThumbnailUrl"; // 👈 use your helper

interface UploadState {
  loading: boolean;
  success: boolean;
  error: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ThumbnailTab({ course }: { course: any }) {
  const { courseId } = useParams<{ courseId: string }>();

  const existingThumbnail = getThumbnailUrl(course); // 👈 get current thumbnail

  const [isEditing, setIsEditing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [uploadState, setUploadState] = useState<UploadState>({
    loading: false,
    success: false,
    error: null,
  });

  const maxFileSize = 5;
  const inputRef = useRef<HTMLInputElement>(null);

  const resetUploadState = () => {
    setUploadState({ loading: false, success: false, error: null });
  };

  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith("image/")) return "Please select a valid image file";
    if (file.size > maxFileSize * 1024 * 1024)
      return `File size must be less than ${maxFileSize}MB`;
    return null;
  };

  const handleFileChange = (selectedFile: File | null) => {
    resetUploadState();
    if (!selectedFile) return;

    const error = validateFile(selectedFile);
    if (error) {
      setUploadState({ loading: false, success: false, error });
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadState({ loading: false, success: false, error: "Select a file first" });
      return;
    }

    setUploadState({ loading: true, success: false, error: null });

    try {
      await coursesApi.update(courseId!, { thumbnail: file });

      setUploadState({ loading: false, success: true, error: null });

      setTimeout(() => {
        setUploadState((p) => ({ ...p, success: false }));
      }, 2000);

      setIsEditing(false);
    } catch (err) {
      setUploadState({
        loading: false,
        success: false,
        error: err instanceof Error ? err.message : "Upload failed.",
      });
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setFile(null);
    setPreview(null);
    resetUploadState();
  };

  // Cleanup preview memory
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  /* ------------------------------------------------------------------ */
  /*                          UI Starts Here                            */
  /* ------------------------------------------------------------------ */

  return (
    <div className="p-6">

      {/* Header */}
      <h2 className="text-xl font-semibold mb-2">Course Thumbnail</h2>
      <p className="text-sm text-gray-500 mb-4">
        Recommended: 1280x720px (16:9 ratio)
      </p>

      {/* -------------------------------------------------------------- */}
      {/* 1️⃣ SHOW EXISTING THUMBNAIL UNTIL USER CLICKS “EDIT THUMBNAIL” */}
      {/* -------------------------------------------------------------- */}
      {!isEditing && (
        <div className="space-y-4">
          <img
            src={existingThumbnail}
            className="w-72 h-40 object-cover rounded-lg border shadow"
          />

          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Pencil className="w-4 h-4" /> Edit Thumbnail
          </button>
        </div>
      )}

      {/* -------------------------------------------------------------- */}
      {/* 2️⃣ UPLOAD FORM (Only visible when editing) */}
      {/* -------------------------------------------------------------- */}
      {isEditing && (
        <div className="space-y-4">

          {/* File Selector */}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
            className="hidden"
          />

          <div
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer bg-gray-50 hover:bg-gray-100"
          >
            <Upload className="w-8 h-8 mx-auto mb-2" />
            <p className="font-medium">
              {file ? `Selected: ${file.name}` : "Click to select image"}
            </p>
          </div>

          {/* Preview */}
          {preview && (
            <div>
              <h3 className="font-medium mb-2">Preview</h3>
              <img
                src={preview}
                className="w-72 h-40 object-cover rounded-lg border shadow"
              />
            </div>
          )}

          {/* Error */}
          {uploadState.error && (
            <p className="text-red-600 text-sm">{uploadState.error}</p>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-3">
            <button
              onClick={handleUpload}
              disabled={uploadState.loading || !file}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {uploadState.loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" /> Upload
                </>
              )}
            </button>

            <button
              onClick={cancelEditing}
              className="px-4 py-2 border rounded-lg"
            >
              Cancel
            </button>
          </div>

          {/* Success */}
          {uploadState.success && (
            <p className="text-green-600 text-sm">Thumbnail updated!</p>
          )}
        </div>
      )}
    </div>
  );
}
