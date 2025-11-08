// services/userApi.ts
import axios from "axios";
// import type { CourseData } from "../types/course";

export async function fetchPurchasedCourses(userId: string) {
  const res = await axios.get(
    `${import.meta.env.VITE_API_URL}/api/user/${userId}/purchased-courses`
  );
  return res.data.purchasedCourses || [];
}

export async function markChapterCompleted(
  userId: string,
  courseId: string,
  completedChapters: string[]
): Promise<string[]> {
  const res = await axios.put(
    `${import.meta.env.VITE_API_URL}/api/user/${userId}/completed`,
    { courseId, chapterIds: completedChapters }, // <-- renamed
    { withCredentials: true }
  );
  return res.data.completedChapters || [];
}
export async function markQuizCompleted(
  userId: string,
  courseId: string,
  chapterTitle: string,
  score: number
) {
  const res = await axios.put(
    `${import.meta.env.VITE_API_URL}/api/user/${userId}/completed`,
    { courseId, chapterIds: [chapterTitle], score },
    { withCredentials: true }
  );
  return res.data;
}

type PurchasedCourse = {
  CourseId: string;
  completedChapters: string[];
};

export async function fetchCoursesByIds(purchasedCourses: PurchasedCourse[]) {
  if (purchasedCourses.length === 0) return [];
  const ids = purchasedCourses.map((c) => c.CourseId);

  const res = await axios.post(
    `${import.meta.env.VITE_API_URL}/courses/bulk-ids`,
    { ids }
  ); // we need a backend route for this
  return res.data.courses || [];
}
