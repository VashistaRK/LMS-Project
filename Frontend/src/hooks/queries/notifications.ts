import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "../../services/notificationService";

const PAGE_SIZE = 20;

export const notificationKeys = {
  all: ["notifications"] as const,
  list: () => [...notificationKeys.all, "list"] as const,
  unreadCount: () => [...notificationKeys.all, "unreadCount"] as const,
};

export function useNotificationsInfinite() {
  return useInfiniteQuery({
    queryKey: notificationKeys.list(),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const page = Number(pageParam ?? 1);
      return notificationService.getNotifications(page, PAGE_SIZE);
    },
    getNextPageParam: (lastPage) => {
      const hasMore = lastPage.notifications.length === PAGE_SIZE;
      return hasMore ? (lastPage.page ?? 1) + 1 : undefined;
    },
  });
}

export function useMarkAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.list() });
      qc.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
    },
  });
}

export function useMarkAllAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.list() });
      qc.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
    },
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.deleteNotification(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.list() });
    },
  });
}