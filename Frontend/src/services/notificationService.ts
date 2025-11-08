import axios,{ type AxiosInstance } from 'axios';

// ✅ Types
export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'course' | 'enrollment' | 'user' | string;
  recipientId: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedNotifications {
  notifications: Notification[];
  page: number;
  limit: number;
  total: number;
  unreadCount?: number;
}

// ✅ Environment
const API_BASE_URL: string =
  import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ✅ Axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// ✅ For HTTP-only cookies, we don't need to add tokens manually
// The cookies are sent automatically with withCredentials: true

export const notificationService = {
  // 🔹 Get user notifications with pagination
  async getNotifications(
    page = 1,
    limit = 20
  ): Promise<PaginatedNotifications> {
    const response = await api.get<PaginatedNotifications>(
      `/api/notifications?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  // 🔹 Get unread count
  async getUnreadCount(): Promise<number> {
    const response = await api.get<{ unreadCount: number }>(
      '/api/notifications/unread-count'
    );
    return response.data.unreadCount;
  },

  // 🔹 Mark notification as read
  async markAsRead(notificationId: string): Promise<Notification> {
    const response = await api.patch<Notification>(
      `/api/notifications/${notificationId}/read`
    );
    return response.data;
  },

  // 🔹 Mark all notifications as read
  async markAllAsRead(): Promise<{ message: string }> {
    const response = await api.patch<{ message: string }>(
      '/api/notifications/mark-all-read'
    );
    return response.data;
  },

  // 🔹 Delete notification
  async deleteNotification(notificationId: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(
      `/api/notifications/${notificationId}`
    );
    return response.data;
  },
};
