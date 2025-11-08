// Test script for notification system
import mongoose from 'mongoose';
import NotificationService from './src/services/notificationService.js';
import User from './src/models/User.js';
import Course from './src/models/Course.js';
import 'dotenv/config';

async function testNotifications() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI, { 
            dbName: process.env.MONGO_DBNAME || undefined 
        });
        console.log('✅ Connected to MongoDB');

        // Create test users
        const admin = await User.findOneAndUpdate(
            { email: 'admin@test.com' },
            { 
                email: 'admin@test.com',
                name: 'Test Admin',
                role: 'admin',
                provider: 'local'
            },
            { upsert: true, new: true }
        );

        const student = await User.findOneAndUpdate(
            { email: 'student@test.com' },
            { 
                email: 'student@test.com',
                name: 'Test Student',
                role: 'student',
                provider: 'local'
            },
            { upsert: true, new: true }
        );

        console.log('✅ Test users created');

        // Test 1: Course creation notification
        console.log('\n🧪 Testing course creation notification...');
        const course = new Course({
            id: 'test-course-1',
            title: 'Test Course',
            description: 'A test course for notifications'
        });
        await course.save();

        await NotificationService.notifyCourseCreated(
            course.id,
            course.title,
            admin._id
        );
        console.log('✅ Course creation notification sent');

        // Test 2: User enrollment notification
        console.log('\n🧪 Testing user enrollment notification...');
        await NotificationService.notifyUserEnrolled(
            student.name,
            course.title,
            course.id,
            student._id
        );
        console.log('✅ User enrollment notification sent');

        // Test 3: New user notification
        console.log('\n🧪 Testing new user notification...');
        await NotificationService.notifyNewUser(
            'New Test Student',
            student._id
        );
        console.log('✅ New user notification sent');

        // Test 4: Get notifications for admin
        console.log('\n🧪 Testing notification retrieval...');
        const adminNotifications = await NotificationService.getUserNotifications(admin._id);
        console.log(`✅ Admin has ${adminNotifications.notifications.length} notifications`);
        console.log(`✅ Unread count: ${adminNotifications.pagination.unreadCount}`);

        // Test 5: Get notifications for student
        const studentNotifications = await NotificationService.getUserNotifications(student._id);
        console.log(`✅ Student has ${studentNotifications.notifications.length} notifications`);
        console.log(`✅ Unread count: ${studentNotifications.pagination.unreadCount}`);

        // Test 6: Mark notification as read
        if (adminNotifications.notifications.length > 0) {
            const firstNotification = adminNotifications.notifications[0];
            await NotificationService.markAsRead(firstNotification._id, admin._id);
            console.log('✅ Notification marked as read');
        }

        console.log('\n🎉 All notification tests passed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
    }
}

// Run the test
testNotifications();
