/* eslint-disable*/
import React from 'react';
import { Bell, Check, Trash2, CheckCheck, RefreshCw } from 'lucide-react';
import { useSocket } from '../hooks/useSocket';
import { useDeleteNotification, useMarkAllAsRead, useMarkAsRead, useNotificationsInfinite, notificationKeys } from '../hooks/queries/notifications';
import { useQueryClient } from '@tanstack/react-query';


const NotificationsPage: React.FC = () => {
    const { unreadCount } = useSocket();
    const qc = useQueryClient();

    const {
        data,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch,
        isRefetching
    } = useNotificationsInfinite();

    const markOne = useMarkAsRead();
    const markAll = useMarkAllAsRead();
    const delOne = useDeleteNotification();

    React.useEffect(() => {
        const s = (window as any).socket;
        if (!s) return;
        const handler = () => {
            qc.invalidateQueries({ queryKey: notificationKeys.list() });
            qc.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
        };
        s.on?.('new_notification', handler);
        return () => s?.off?.('new_notification', handler);
    }, [qc]);

    const notifications = (data?.pages ?? []).flatMap(p => p.notifications);

    const handleRefresh = async () => {
        await refetch();
    };

    const handleMarkAsRead = async (notificationId: string) => {
        await markOne.mutateAsync(notificationId);
    };

    const handleMarkAllAsRead = async () => {
        await markAll.mutateAsync();
    };

    const handleDeleteNotification = async (notificationId: string) => {
        await delOne.mutateAsync(notificationId);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
        if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
        return date.toLocaleDateString();
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'course_created': return '📚';
            case 'user_enrolled': return '👥';
            case 'new_user': return '👤';
            case 'course_updated': return '📝';
            case 'course_deleted': return '🗑️';
            default: return '🔔';
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'course_created': return 'bg-green-100 text-green-800';
            case 'user_enrolled': return 'bg-blue-100 text-blue-800';
            case 'new_user': return 'bg-purple-100 text-purple-800';
            case 'course_updated': return 'bg-yellow-100 text-yellow-800';
            case 'course_deleted': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Bell className="w-8 h-8 text-gray-600" />
                        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                        {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-sm px-2 py-1 rounded-full">
                                {unreadCount} unread
                            </span>
                        )}
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handleRefresh}
                            disabled={isRefetching}
                            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
                            <span>Refresh</span>
                        </button>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors"
                            >
                                <CheckCheck className="w-4 h-4" />
                                <span>Mark all read</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {isLoading && notifications.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-gray-500">Loading notifications...</p>
                    </div>
                </div>
            ) : notifications.length === 0 ? (
                <div className="text-center py-12">
                    <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications yet</h3>
                    <p className="text-gray-500">You'll see notifications here when they arrive.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {notifications.map((notification) => (
                        <div
                            key={notification._id}
                            className={`bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow ${
                                !notification.isRead ? 'border-l-4 border-l-blue-500' : ''
                            }`}
                        >
                            <div className="flex items-start space-x-4">
                                <div className="text-2xl">
                                    {getNotificationIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <h3 className="text-lg font-medium text-gray-900">
                                                    {notification.title}
                                                </h3>
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getNotificationColor(notification.type)}`}>
                                                    {notification.type.replace('_', ' ')}
                                                </span>
                                                {!notification.isRead && (
                                                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                                )}
                                            </div>
                                            <p className="text-gray-600 mb-2">
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-500">
                                                    {formatDate(notification.createdAt)}
                                                </span>
                                                <div className="flex items-center space-x-2">
                                                    {!notification.isRead && (
                                                        <button
                                                            onClick={() => handleMarkAsRead(notification._id)}
                                                            className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                            <span>Mark read</span>
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteNotification(notification._id)}
                                                        className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-800 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        <span>Delete</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {hasNextPage && (
                        <div className="text-center py-4">
                            <button
                                onClick={() => fetchNextPage()}
                                disabled={isFetchingNextPage}
                                className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors disabled:opacity-50"
                            >
                                {isFetchingNextPage ? 'Loading...' : 'Load more'}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationsPage;