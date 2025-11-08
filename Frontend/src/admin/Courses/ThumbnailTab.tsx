/* eslint-disable react-hooks/exhaustive-deps */
// import { useState } from "react";
// import { coursesApi } from "../../services/GlobalApi";
// import { useParams } from "react-router";

// export default function ThumbnailTab() {
//   const { courseId } = useParams<{ courseId: string }>();
//   const [file, setFile] = useState<File | null>(null);
//   const [preview, setPreview] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const f = e.target.files?.[0] || null;
//     setFile(f);
//     setPreview(f ? URL.createObjectURL(f) : null);
//   };

//   const handleUpload = async () => {
//     if (!file) return alert("Please select a file");
//     if (!courseId) return console.error("Course ID is missing.");
//     setLoading(true);
//     try {
//       await coursesApi.update(courseId, { thumbnail: file });
//       alert("Thumbnail uploaded successfully!");
//     } catch (err) {
//       console.error(err);
//       alert("Upload failed");
//     } finally {
//       setLoading(false);
//     }
//   };
//   const baseStyles =
//     "relative inline-flex items-center gap-3 px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 cursor-pointer border-2 border-dashed focus:outline-none focus:ring-2 focus:ring-offset-2";
//   return (
//     <div className="p-4 border rounded-lg">
//       <h2 className="text-lg font-semibold mb-2">Upload Thumbnail</h2>

//       <nav
//         className={`${baseStyles} bg-gray-900 border-gray-700 text-white hover:bg-gray-800 hover:border-gray-600 focus:ring-gray-500 `}
//       >
//         <input
//           type="file"
//           accept="image/*"
//           onChange={handleFileChange}
//           className="mb-3"
//         />
//       </nav>

//       {preview && (
//         <img
//           src={preview}
//           alt="Preview"
//           className="w-40 h-40 object-cover rounded mb-3 border"
//         />
//       )}

//       <button
//         onClick={handleUpload}
//         disabled={loading}
//         className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
//       >
//         {loading ? "Uploading..." : "Upload"}
//       </button>
//     </div>
//   );
// }
import { useState, useRef, useEffect } from "react";
import { coursesApi } from "../../services/GlobalApi";
import { useParams } from "react-router";
import { Upload, Image, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface UploadState {
  loading: boolean;
  success: boolean;
  error: string | null;
}

export default function ThumbnailTab() {
  const { courseId } = useParams<{ courseId: string }>();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>({
    loading: false,
    success: false,
    error: null,
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const maxFileSize = 5; // 5MB limit

  const resetUploadState = () => {
    setUploadState({ loading: false, success: false, error: null });
  };

  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith("image/")) {
      return "Please select a valid image file";
    }

    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size must be less than ${maxFileSize}MB`;
    }

    return null;
  };

  const handleFileChange = (selectedFile: File | null) => {
    resetUploadState();

    if (!selectedFile) {
      setFile(null);
      setPreview(null);
      return;
    }

    const error = validateFile(selectedFile);
    if (error) {
      setUploadState((prev) => ({ ...prev, error }));
      return;
    }

    setFile(selectedFile);

    // Clean up previous preview URL
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    handleFileChange(selectedFile);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileChange(droppedFile);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadState((prev) => ({ ...prev, error: "Please select a file" }));
      return;
    }

    if (!courseId) {
      setUploadState((prev) => ({ ...prev, error: "Course ID is missing" }));
      return;
    }

    setUploadState({ loading: true, success: false, error: null });

    try {
      await coursesApi.update(courseId, { thumbnail: file });
      setUploadState({ loading: false, success: true, error: null });

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setUploadState((prev) => ({ ...prev, success: false }));
      }, 3000);
    } catch (err) {
      console.error("Upload failed:", err);
      setUploadState({
        loading: false,
        success: false,
        error:
          err instanceof Error
            ? err.message
            : "Upload failed. Please try again.",
      });
    }
  };

  const handleRemoveFile = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setFile(null);
    setPreview(null);
    resetUploadState();
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  // Cleanup preview URL on unmount
  const cleanupPreview = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
  };

  useEffect(() => {
    return cleanupPreview;
  }, [preview]);

  const getFileInputStyles = () => {
    const baseStyles =
      "relative inline-flex items-center justify-center gap-3 px-6 py-8 rounded-lg font-medium text-sm transition-all duration-200 cursor-pointer border-2 border-dashed focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[120px] w-full";

    if (dragActive) {
      return `${baseStyles} border-blue-400 bg-blue-50 text-blue-700`;
    }

    if (file) {
      return `${baseStyles} border-green-400 bg-green-50 text-green-700`;
    }

    return `${baseStyles} border-gray-300 bg-gray-50 text-gray-600 hover:border-gray-400 hover:bg-gray-100 focus:ring-gray-500`;
  };

  return (
    <div className="p-6 border rounded-xl bg-white shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Course Thumbnail
        </h2>
        <p className="text-sm text-gray-600">
          Upload an image to represent your course. Recommended size: 1280x720px
          (16:9 ratio)
        </p>
      </div>

      {/* File Input Area */}
      <div className="space-y-4">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="sr-only"
        />

        <div
          onClick={handleClick}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={getFileInputStyles()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleClick();
            }
          }}
        >
          {dragActive ? (
            <div className="flex flex-col items-center">
              <Upload className="w-8 h-8 mb-2" />
              <span className="font-medium">Drop your image here</span>
            </div>
          ) : file ? (
            <div className="flex flex-col items-center">
              <CheckCircle className="w-8 h-8 mb-2" />
              <span className="font-medium">File selected: {file.name}</span>
              <span className="text-xs text-gray-500 mt-1">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Image className="w-8 h-8 mb-2" />
              <span className="font-medium">Choose image or drag & drop</span>
              <span className="text-xs text-gray-500 mt-1">
                PNG, JPG, GIF up to {maxFileSize}MB
              </span>
            </div>
          )}
        </div>

        {/* Error Message */}
        {uploadState.error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{uploadState.error}</p>
          </div>
        )}

        {/* Success Message */}
        {uploadState.success && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <p className="text-sm text-green-700">
              Thumbnail uploaded successfully!
            </p>
          </div>
        )}

        {/* Preview */}
        {preview && !uploadState.error && (
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Preview</h3>
            <div className="relative inline-block">
              <img
                src={preview}
                alt="Thumbnail preview"
                className="w-64 h-36 object-cover rounded-lg border shadow-sm"
              />
              <button
                onClick={handleRemoveFile}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                title="Remove file"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t justify-end">
          <button
            onClick={handleUpload}
            disabled={!file || uploadState.loading || !!uploadState.error}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {uploadState.loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload Thumbnail
              </>
            )}
          </button>

          {file && (
            <button
              onClick={handleRemoveFile}
              disabled={uploadState.loading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
