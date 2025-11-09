/* eslint-disable  */
import React, { useState, useEffect } from 'react';
import { X, Check, Bell } from 'lucide-react';
import { useSocket } from '../hooks/useSocket';
import { useAuthContext } from '../context/AuthProvider';
import { notificationService } from '../services/notificationService';

interface ToastNotification {
    id: string;
    type: string;
    title: string;
    message: string;
    createdAt: string;
    visible: boolean;
}

const NotificationToast: React.FC = () => {
    const [toasts, setToasts] = useState<ToastNotification[]>([]);
    const { socket } = useSocket();
    const { user } = useAuthContext();

    

    useEffect(() => {
        if (socket) {
            socket.on('new_notification', (notification: any) => {
                showToast(notification);
            });
        }

        return () => {
            if (socket) {
                socket.off('new_notification');
            }
        };
    }, [socket]);

    const showToast = (notification: any) => {
        const toastId = Date.now().toString();
        const toast: ToastNotification = {
            id: toastId,
            ...notification,
            visible: true
        };

        setToasts(prev => [...prev, toast]);

        // Auto remove after 5 seconds
        setTimeout(() => {
            removeToast(toastId);
        }, 5000);
    };

    const removeToast = (toastId: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== toastId));
    };

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            await notificationService.markAsRead(notificationId);
        } catch (error) {
            // Silent fail for mark as read errors
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'course_created':
                return '📚';
            case 'user_enrolled':
                return '👥';
            case 'new_user':
                return '👤';
            case 'course_updated':
                return '📝';
            case 'course_deleted':
                return '🗑️';
            default:
                return '🔔';
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'course_created':
                return 'bg-green-500';
            case 'user_enrolled':
                return 'bg-blue-500';
            case 'new_user':
                return 'bg-purple-500';
            case 'course_updated':
                return 'bg-yellow-500';
            case 'course_deleted':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };
    
    // Don't render if user is not logged in
    if (!user) {
        return null;
    }

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`transform transition-all duration-300 ease-in-out ${
                        toast.visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
                    }`}
                >
                    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
                        <div className="flex items-start space-x-3">
                            <div className={`w-8 h-8 rounded-full ${getNotificationColor(toast.type)} flex items-center justify-center text-white text-sm`}>
                                {getNotificationIcon(toast.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900">
                                            {toast.title}
                                        </h4>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {toast.message}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => removeToast(toast.id)}
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between mt-3">
                                    <span className="text-xs text-gray-500">
                                        {new Date(toast.createdAt).toLocaleTimeString()}
                                    </span>
                                    <button
                                        onClick={() => {
                                            handleMarkAsRead(toast.id);
                                            removeToast(toast.id);
                                        }}
                                        className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                                    >
                                        <Check className="w-3 h-3" />
                                        <span>Mark read</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
            
            {/* Removed connection-lost toast per UX request. Socket disconnect no longer shows this toast. */}
        </div>
    );
};

export default NotificationToast;
