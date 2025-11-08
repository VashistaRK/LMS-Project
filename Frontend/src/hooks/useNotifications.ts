import { useState, useEffect } from 'react';
import { useSocket } from './useSocket';
import { notificationService } from '../services/notificationService';

interface Notification {
    _id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

export const useNotifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    
    const { 
        socket, 
        isConnected, 
        unreadCount, 
        markAsRead, 
        markAllAsRead, 
        removeNotification 
    } = useSocket();

    // Load notifications
    const loadNotifications = async (pageNum: number = 1, reset: boolean = false) => {
        if (loading && !reset) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const response = await notificationService.getNotifications(pageNum, 20);
            const newNotifications = response.notifications;
            
            if (reset) {
                setNotifications(newNotifications);
            } else {
                setNotifications(prev => [...prev, ...newNotifications]);
            }
            
            setHasMore(newNotifications.length === 20);
            setPage(pageNum);
        } catch (err: any) {
            setError(err.message || 'Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    // Load more notifications
    const loadMore = () => {
        if (!loading && hasMore) {
            loadNotifications(page + 1, false);
        }
    };

    // Mark notification as read
    const handleMarkAsRead = async (notificationId: string) => {
        try {
            await notificationService.markAsRead(notificationId);
            markAsRead(notificationId);
            setNotifications(prev => 
                prev.map(notif => 
                    notif._id === notificationId 
                        ? { ...notif, isRead: true }
                        : notif
                )
            );
        } catch (err: any) {
            setError(err.message || 'Failed to mark notification as read');
        }
    };

    // Mark all notifications as read
    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            markAllAsRead();
            setNotifications(prev => 
                prev.map(notif => ({ ...notif, isRead: true }))
            );
        } catch (err: any) {
            setError(err.message || 'Failed to mark all notifications as read');
        }
    };

    // Delete notification
    const handleDeleteNotification = async (notificationId: string) => {
        try {
            await notificationService.deleteNotification(notificationId);
            removeNotification(notificationId);
            setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
        } catch (err: any) {
            setError(err.message || 'Failed to delete notification');
        }
    };

    // Refresh notifications
    const refresh = () => {
        loadNotifications(1, true);
    };

    // Listen for real-time notifications
    useEffect(() => {
        if (socket) {
            socket.on('new_notification', (notification: Notification) => {
                setNotifications(prev => [notification, ...prev]);
            });
        }

        return () => {
            if (socket) {
                socket.off('new_notification');
            }
        };
    }, [socket]);

    return {
        notifications,
        loading,
        error,
        hasMore,
        unreadCount,
        isConnected,
        loadNotifications,
        loadMore,
        handleMarkAsRead,
        handleMarkAllAsRead,
        handleDeleteNotification,
        refresh
    };
};
