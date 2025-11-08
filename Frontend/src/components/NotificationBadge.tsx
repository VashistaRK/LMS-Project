import React from 'react';
import { Bell } from 'lucide-react';
import { useSocket } from '../hooks/useSocket';

interface NotificationBadgeProps {
    className?: string;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ className = "" }) => {
    const { unreadCount } = useSocket();

    return (
        <div className={`relative ${className}`}>
            <Bell className="w-6 h-6 text-gray-600 hover:text-gray-800 transition-colors" />
            {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {unreadCount > 99 ? '99+' : unreadCount}
                </span>
            )}
        </div>
    );
};

export default NotificationBadge;
