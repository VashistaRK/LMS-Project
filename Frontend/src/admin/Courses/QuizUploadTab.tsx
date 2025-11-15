/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { uploadQuizDoc } from "@/services/questionApi"; // <-- IMPORTANT

interface QuizUploadFormProps {
  onUploadSuccess?: (quizId: string) => void;
  courseId: string;
  sectionId: string;
  chapterId: string;
}

function UploadForm({ courseId, sectionId, chapterId, onUploadSuccess }: QuizUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const uploadMutation = useMutation({
    mutationFn: (form: FormData) =>
      uploadQuizDoc(courseId, sectionId, chapterId, form),
    onSuccess: (data: any) => {
      if (data.success && onUploadSuccess) onUploadSuccess(data.quizId);
    },
    onError: () => {
      alert("⚠️ Server error while uploading file");
    }
  });
  
  const handleUpload = async () => {
    if (!file) return;
    const form = new FormData();
    form.append("doc", file);
    console.log("UploadForm props:", { courseId, sectionId, chapterId });
    await uploadMutation.mutateAsync(form);
  };

  return (
    <div className="space-y-4">
      <label
        htmlFor="file-upload"
        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition"
      >
        <svg
          className="w-10 h-10 text-gray-400 mb-2"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7 16V4a1 1 0 011-1h8a1 1 0 011 1v12m-4 4h4m-4 0H7m4-4v4"
          />
        </svg>
        <p className="text-gray-600 text-sm">
          {file ? file.name : "Click or drag & drop a .pdf or .docx file"}
        </p>
      <input type="file" accept=".pdf,.docx" onChange={(e)=>setFile(e.target.files?.[0] || null)} /></label>

      <button onClick={handleUpload}>
        {uploadMutation.isPending ? "Uploading..." : "Upload & Generate Quiz"}
      </button>
    </div>
  );
}

export default UploadForm;
