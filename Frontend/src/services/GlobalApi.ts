/* eslint-disable */
import axios, { type AxiosInstance } from "axios";
import type { CourseData } from "../types/course";

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Handle API responses and errors
const handleRequest = async <T>(promise: Promise<{ data: T }>): Promise<T> => {
  try {
    const res = await promise;
    return res.data;
  } catch (err: any) {
    console.error("API Error:", err.response?.data || err.message);
    throw err.response?.data || err;
  }
};

export const coursesApi = {
  // Fetch all courses
  getAll: () => handleRequest<CourseData[]>(api.get("/courses")),

  // Fetch single course by ID
  getById: (id: string) => handleRequest<CourseData>(api.get(`/courses/${id}`)),

  // Create a new course
  create: (courseData: Omit<CourseData, "id">) =>
    handleRequest<CourseData>(api.post("/courses", courseData)),

  // Update course (supports text + file uploads like thumbnail)
  update: (id: string, courseData: Partial<CourseData>) => {
    const formData = new FormData();

    Object.entries(courseData).forEach(([key, value]) => {
      if (value instanceof File) {
        // File uploads
        formData.append(key, value);
      } else if (Array.isArray(value)) {
        if (value.every((v) => typeof v === "object" && v !== null)) {
          // ✅ Array of objects → send as JSON string
          formData.append(key, JSON.stringify(value));
        } else {
          // ✅ Array of primitives → send normally
          value.forEach((v) => formData.append(`${key}[]`, String(v)));
        }
      } else if (typeof value === "object" && value !== null) {
        // Single object → send as JSON string
        formData.append(key, JSON.stringify(value));
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    return handleRequest<CourseData>(
      api.put(`/courses/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    );
  },

  // Delete course
  delete: (id: string) =>
    handleRequest<{ message: string }>(api.delete(`/courses/${id}`)),

  // Upload video/thumbnail for a specific chapter
  uploadChapterFiles: (
    courseId: string,
    chapterId: string,
    files: { video?: File; thumbnail?: File }
  ) => {
    const formData = new FormData();
    if (files.video) formData.append("video", files.video);
    if (files.thumbnail) formData.append("thumbnail", files.thumbnail);

    return handleRequest(
      api.post(`/courses/${courseId}/chapters/${chapterId}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    );
  },
};

export default api;
