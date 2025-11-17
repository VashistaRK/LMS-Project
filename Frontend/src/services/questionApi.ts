/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: true,
});

// Global response handler
API.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const msg =
      err.response?.data?.error ||
      err.response?.data?.message ||
      err.message ||
      "API Error";
    return Promise.reject(new Error(msg));
  }
);

// =======================
// 📌 Questions API
// =======================

export async function uploadQuizDoc(
  courseId: string,
  sectionId: string,
  chapterId: string,
  form: FormData
) {
  return API.post(
    `/api/questions/${courseId}/${sectionId}/${chapterId}/upload-doc`,
    form
  );
}

export async function getQuestions(genre?: string) {
  return API.get("/api/questions", {
    params: genre ? { genre } : {},
  });
}

export async function getQuestion(id: string) {
  return API.get(`/api/questions/${id}`);
}

export async function createQuestion(payload: any) {
  return API.post("/api/questions", payload);
}

export async function updateQuestion(id: string, payload: any) {
  return API.put(`/api/questions/${id}`, payload);
}

export async function deleteQuestion(id: string) {
  return API.delete(`/api/questions/${id}`);
}

export async function getGenres() {
  return API.get("/api/questions/genres");
}
