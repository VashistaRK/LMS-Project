import React, { useState } from "react";
import {
  Trash2,
  Plus,
  Video,
  ImageIcon,
  X,
  FileVideo,
  CheckCircle,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";

interface Chapter {
  id: number;
  title: string;
  video: File | null;
  thumbnail: File | null;
  videoPreview?: string;
  thumbnailPreview?: string;
  duration?: string;
  size?: string;
}

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

const MediaLibraryTab: React.FC = () => {
  const [chapters, setChapters] = useState<Chapter[]>([
    { id: Date.now(), title: "Chapter 1", video: null, thumbnail: null },
  ]);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const createPreviewUrl = (file: File): string => {
    return URL.createObjectURL(file);
  };

  const createCourse = useMutation({
    mutationFn: async (payload: { title: string; description: string; chapters: { title: string }[] }) => {
      const res = await fetch(`${API}/api/courses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Course creation failed");
      return res.json();
    },
  });

  const uploadChapterMedia = useMutation({
    mutationFn: async (payload: { courseId: string; chapterId: string; formData: FormData }) => {
      const { courseId, chapterId, formData } = payload;
      const res = await fetch(`${API}/api/courses/${courseId}/chapters/${chapterId}/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Upload failed");
      return res.json();
    },
  });

  // ✅ Called when saving media library
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting chapters:", chapters);

    try {
      const course = await createCourse.mutateAsync({
        title: "React Course",
        description: "Course description...",
        chapters: chapters.map((ch) => ({ title: ch.title })),
      });

      for (const chapter of course.chapters) {
        const localChapter = chapters.find((ch) => ch.title === chapter.title);
        if (!localChapter?.video || !localChapter?.thumbnail) {
          console.log(`Skipping ${chapter.title} (missing files)`);
          continue;
        }

        const formData = new FormData();
        formData.append("video", localChapter.video);
        formData.append("thumbnail", localChapter.thumbnail);

        await uploadChapterMedia.mutateAsync({
          courseId: course._id,
          chapterId: chapter._id,
          formData,
        });
      }

      alert("✅ Course and media uploaded successfully!");
    } catch (err) {
      console.error("Upload failed:", err);
      alert("❌ Upload failed");
    }
  };

  const handleAddChapter = () => {
    const newChapterNumber = chapters.length + 1;
    setChapters([
      ...chapters,
      {
        id: Date.now(),
        title: `Chapter ${newChapterNumber}`,
        video: null,
        thumbnail: null,
      },
    ]);
  };

  const handleRemoveChapter = (id: number) => {
    if (chapters.length > 1) {
      setChapters(chapters.filter((chapter) => chapter.id !== id));
    }
  };

  const handleTitleChange = (id: number, title: string) => {
    setChapters(
      chapters.map((chapter) =>
        chapter.id === id ? { ...chapter, title } : chapter
      )
    );
  };

  const handleFileChange = (
    id: number,
    field: "video" | "thumbnail",
    file: File | null
  ) => {
    if (file) {
      const previewUrl = createPreviewUrl(file);
      const size = formatFileSize(file.size);

      setChapters(
        chapters.map((chapter) =>
          chapter.id === id
            ? {
                ...chapter,
                [field]: file,
                [`${field}Preview`]: previewUrl,
                ...(field === "video" ? { size } : {}),
              }
            : chapter
        )
      );
    } else {
      setChapters(
        chapters.map((chapter) =>
          chapter.id === id
            ? {
                ...chapter,
                [field]: null,
                [`${field}Preview`]: undefined,
                ...(field === "video" ? { size: undefined } : {}),
              }
            : chapter
        )
      );
    }
  };

  const handleDragStart = (e: React.DragEvent, id: number) => {
    setDraggedItem(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, dropId: number) => {
    e.preventDefault();
    if (draggedItem === null) return;

    const dragIndex = chapters.findIndex((c) => c.id === draggedItem);
    const dropIndex = chapters.findIndex((c) => c.id === dropId);

    if (dragIndex === -1 || dropIndex === -1) return;

    const newChapters = [...chapters];
    const [draggedChapter] = newChapters.splice(dragIndex, 1);
    newChapters.splice(dropIndex, 0, draggedChapter);

    setChapters(newChapters);
    setDraggedItem(null);
  };

  const FileUploadArea: React.FC<{
    chapter: Chapter;
    field: "video" | "thumbnail";
    accept: string;
    icon: React.ReactNode;
    title: string;
    description: string;
  }> = ({ chapter, field, accept, icon, title, description }) => {
    const file = chapter[field];
    const preview = chapter[`${field}Preview` as keyof Chapter] as string;
    const hasFile = Boolean(file);

    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          {title}
        </label>

        {!hasFile ? (
          <label className="relative block w-full border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all duration-200 group">
            <input
              type="file"
              accept={accept}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) =>
                handleFileChange(
                  chapter.id,
                  field,
                  e.target.files ? e.target.files[0] : null
                )
              }
            />
            <div className="space-y-3">
              <div className="mx-auto w-12 h-12 text-gray-400 group-hover:text-blue-500 transition-colors">
                {icon}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
                  Click to upload {title.toLowerCase()}
                </p>
                <p className="text-xs text-gray-500">{description}</p>
              </div>
            </div>
          </label>
        ) : (
          <div className="relative bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3 flex-1">
                {field === "video" ? (
                  <div className="relative w-16 h-12 bg-gray-900 rounded-lg overflow-hidden flex items-centered justify-center">
                    <FileVideo className="w-6 h-6 text-white" />
                  </div>
                ) : (
                  <div className="relative w-16 h-12 bg-gray-100 rounded-lg overflow-hidden">
                    {preview && (
                      <img
                        src={preview}
                        alt="Thumbnail preview"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file?.name}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <p className="text-xs text-gray-500">
                      {field === "video" &&
                        chapter.size &&
                        `${chapter.size} • `}
                      Uploaded successfully
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleFileChange(chapter.id, field, null)}
                className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Media Library</h2>
          <p className="text-gray-600">
            Upload videos and thumbnails for each chapter. Drag and drop to
            reorder chapters.
          </p>
        </div>

        {/* Chapters */}
        <div className="space-y-6">
          {chapters.map((chapter, index) => (
            <div
              key={chapter.id}
              draggable
              onDragStart={(e) => handleDragStart(e, chapter.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, chapter.id)}
              className="group bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-move"
            >
              {/* Chapter Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    value={chapter.title}
                    onChange={(e) =>
                      handleTitleChange(chapter.id, e.target.value)
                    }
                    className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:bg-gray-50 px-2 py-1 rounded"
                    placeholder="Chapter title..."
                  />
                </div>

                {chapters.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveChapter(chapter.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* File Upload Areas */}
              <div className="grid md:grid-cols-2 gap-6">
                <FileUploadArea
                  chapter={chapter}
                  field="video"
                  accept="video/*"
                  icon={<Video className="w-full h-full" />}
                  title="Video File"
                  description="MP4, MOV, AVI up to 500MB"
                />

                <FileUploadArea
                  chapter={chapter}
                  field="thumbnail"
                  accept="image/*"
                  icon={<ImageIcon className="w-full h-full" />}
                  title="Thumbnail"
                  description="PNG, JPG, GIF up to 5MB"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Add Chapter */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleAddChapter}
            className="inline-flex items-center px-6 py-3 bg-white border-2 border-dashed border-gray-300 rounded-xl text-gray-700 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Chapter
          </button>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-6 border-t border-gray-200">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            Save Media Library
          </button>
        </div>
      </form>
    </div>
  );
};

export default MediaLibraryTab;