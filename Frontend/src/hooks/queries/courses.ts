import { useQuery } from "@tanstack/react-query";
import { coursesApi } from "../../services/GlobalApi";
import type { CourseData } from "../../types/course";
import axios from "axios";

const api = import.meta.env.VITE_API_URL;

export const coursesKeys = {
  all: ["courses"] as const,
  list: () => [...coursesKeys.all, "list"] as const,
  detail: (id: string) => [...coursesKeys.all, "detail", id] as const,
};

export function useCourses() {
  return useQuery<CourseData[]>({
    queryKey: coursesKeys.list(),
    queryFn: () => coursesApi.getAll(),
  });
}

export function useCourse(id?: string) {
  return useQuery<CourseData>({
    queryKey: id ? coursesKeys.detail(id) : ["course:missing"],
    queryFn: () => coursesApi.getById(id!),
    enabled: !!id,
  });
}

export const useRelatedCourses = (courseId: string) => {
  return useQuery({
    queryKey: ["relatedCourses", courseId],
    queryFn: async (): Promise<CourseData[]> => {
      const { data } = await axios.get(`${api}/courses/${courseId}/related`);
      return data.courses; // Adjust to your API shape
    },
    enabled: !!courseId,
  });
};
