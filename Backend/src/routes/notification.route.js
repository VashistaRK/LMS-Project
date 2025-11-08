import express from 'express';
import NotificationService from '../services/notificationService.js';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Middleware to verify HTTP-only cookie session
const authenticateToken = async (req, res, next) => {
    try {
        const token = req.cookies?.app_session;
        
        if (!token) {
            return res.status(401).json({ error: 'No session found' });
        }

        const decoded = jwt.verify(token, process.env.APP_JWT_SECRET, {
            issuer: process.env.APP_JWT_ISS,
            audience: process.env.APP_JWT_AUD,
        });
        
        const user = await User.findById(decoded.sub);
        
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid session' });
    }
};

// Get user notifications with pagination
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const result = await NotificationService.getUserNotifications(
            req.user._id, 
            parseInt(page), 
            parseInt(limit)
        );
        
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// Get unread count
router.get('/unread-count', authenticateToken, async (req, res) => {
    try {
        const count = await NotificationService.getUnreadCount(req.user._id);
        res.json({ unreadCount: count });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get unread count' });
    }
});

// Mark notification as read
router.patch('/:notificationId/read', authenticateToken, async (req, res) => {
    try {
        const { notificationId } = req.params;
        const notification = await NotificationService.markAsRead(notificationId, req.user._id);
        
        res.json(notification);
    } catch (error) {
        if (error.message === 'Notification not found or unauthorized') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
});

// Mark all notifications as read
router.patch('/mark-all-read', authenticateToken, async (req, res) => {
    try {
        const result = await NotificationService.markAllAsRead(req.user._id);
        res.json({ 
            message: 'All notifications marked as read',
            modifiedCount: result.modifiedCount 
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
});

// Delete notification
router.delete('/:notificationId', authenticateToken, async (req, res) => {
    try {
        const { notificationId } = req.params;
        const notification = await NotificationService.deleteNotification(notificationId, req.user._id);
        
        if (!notification) {
            return res.status(404).json({ error: 'Notification not found or unauthorized' });
        }
        
        res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete notification' });
    }
});

export default router;
