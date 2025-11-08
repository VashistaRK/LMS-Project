import Notification from '../models/Notification.js';
import User from '../models/User.js';

class NotificationService {
    // Create and send notification
    static async createNotification(notificationData) {
        try {
            const notification = new Notification(notificationData);
            await notification.save();
            
            // Send real-time notification via Socket.IO
            if (global.io) {
                const recipientRoom = `user_${notificationData.recipient}`;
                global.io.to(recipientRoom).emit('new_notification', {
                    id: notification._id,
                    type: notification.type,
                    title: notification.title,
                    message: notification.message,
                    createdAt: notification.createdAt,
                    isRead: notification.isRead
                });
            }
            
            return notification;
        } catch (error) {
            throw error;
        }
    }

    // Notify all users about new course
    static async notifyCourseCreated(courseId, courseTitle, adminId) {
        try {
            const users = await User.find({ role: 'student' });
            const notifications = [];

            for (const user of users) {
                const notification = await this.createNotification({
                    type: 'course_created',
                    title: 'New Course Available',
                    message: `New course available: ${courseTitle}`,
                    recipient: user._id,
                    sender: adminId,
                    courseId: courseId,
                    metadata: {
                        courseTitle: courseTitle
                    }
                });
                notifications.push(notification);
            }

            return notifications;
        } catch (error) {
            throw error;
        }
    }

    // Notify admin about user enrollment
    static async notifyUserEnrolled(studentName, courseTitle, courseId, studentId) {
        try {
            const admins = await User.find({ role: 'admin' });
            const notifications = [];

            for (const admin of admins) {
                const notification = await this.createNotification({
                    type: 'user_enrolled',
                    title: 'Student Enrolled',
                    message: `Student ${studentName} enrolled in ${courseTitle}`,
                    recipient: admin._id,
                    sender: studentId,
                    courseId: courseId,
                    metadata: {
                        studentName: studentName,
                        courseTitle: courseTitle
                    }
                });
                notifications.push(notification);
            }

            return notifications;
        } catch (error) {
            throw error;
        }
    }

    // Notify admin about new user registration
    static async notifyNewUser(userName, userId) {
        try {
            const admins = await User.find({ role: 'admin' });
            const notifications = [];

            for (const admin of admins) {
                const notification = await this.createNotification({
                    type: 'new_user',
                    title: 'New Student Joined',
                    message: `New student joined: ${userName}`,
                    recipient: admin._id,
                    sender: userId,
                    metadata: {
                        userName: userName
                    }
                });
                notifications.push(notification);
            }

            return notifications;
        } catch (error) {
            throw error;
        }
    }

    // Get notifications for a user
    static async getUserNotifications(userId, page = 1, limit = 20) {
        try {
            const skip = (page - 1) * limit;
            const notifications = await Notification.find({ recipient: userId })
                .populate('sender', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            const total = await Notification.countDocuments({ recipient: userId });
            const unreadCount = await Notification.countDocuments({ 
                recipient: userId, 
                isRead: false 
            });

            return {
                notifications,
                pagination: {
                    current: page,
                    pages: Math.ceil(total / limit),
                    total,
                    unreadCount
                }
            };
        } catch (error) {
            throw error;
        }
    }

    // Mark notification as read
    static async markAsRead(notificationId, userId) {
        try {
            const notification = await Notification.findOneAndUpdate(
                { _id: notificationId, recipient: userId },
                { 
                    isRead: true, 
                    readAt: new Date() 
                },
                { new: true }
            );

            if (!notification) {
                throw new Error('Notification not found or unauthorized');
            }

            return notification;
        } catch (error) {
            throw error;
        }
    }

    // Mark all notifications as read for a user
    static async markAllAsRead(userId) {
        try {
            const result = await Notification.updateMany(
                { recipient: userId, isRead: false },
                { 
                    isRead: true, 
                    readAt: new Date() 
                }
            );

            return result;
        } catch (error) {
            throw error;
        }
    }

    // Get unread count for a user
    static async getUnreadCount(userId) {
        try {
            const count = await Notification.countDocuments({ 
                recipient: userId, 
                isRead: false 
            });
            return count;
        } catch (error) {
            throw error;
        }
    }

    // Delete notification
    static async deleteNotification(notificationId, userId) {
        try {
            const notification = await Notification.findOneAndDelete({
                _id: notificationId,
                recipient: userId
            });

            return notification;
        } catch (error) {
            throw error;
        }
    }
}

export default NotificationService;
