import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import type { CourseData } from "../../types/course";

const api = import.meta.env.VITE_API_URL;

export const cartKeys = {
  all: ["cart"] as const,
  list: () => [...cartKeys.all, "list"] as const,
};

export function useCart() {
  return useQuery<CourseData[]>({
    queryKey: cartKeys.list(),
    queryFn: async () => {
      // First get cart course IDs from backend
      const { data: courseIds } = await axios.get<string[]>(`${api}/cart`, { withCredentials: true });

      if (!courseIds || courseIds.length === 0) {
        return [];
      }

      // Then fetch full course details for each ID
      const coursePromises = courseIds.map(async (courseId) => {
        try {
          const { data } = await axios.get<CourseData>(`${api}/courses/${courseId}`, { withCredentials: true });
          return data;
        } catch (error) {
          console.error(`Failed to fetch course ${courseId}:`, error);
          return null;
        }
      });

      const courses = await Promise.all(coursePromises);
      return courses.filter((course): course is CourseData => course !== null);
    },
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (courseId: string) => {
      const { data } = await axios.post(`${api}/cart/add`, { courseId }, { withCredentials: true });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.list() });
    },
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (courseId: string) => {
      const { data } = await axios.post(`${api}/cart/remove`, { courseId }, { withCredentials: true });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.list() });
    },
  });
}

export function useCheckout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await axios.post(`${api}/cart/checkout`, {}, { withCredentials: true });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.list() });
    },
  });
}


export function useRequestPurchase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await axios.post(`${api}/cart/checkout`, {}, { withCredentials: true });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.list() });
    },
  });
}

