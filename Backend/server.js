import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import jwt from 'jsonwebtoken';
import helmet from "helmet";
import morgan from 'morgan';
import compression from 'compression';
import responseTime from 'response-time';
import rateLimit from 'express-rate-limit';

import courseRoutes from './src/routes/course.route.js';
import localAuth from './src/routes/auth.local.js';
import oidcAuth from './src/routes/auth.oidc.js';
import cartRoutes from './src/routes/cart.route.js';
import userRoutes from './src/routes/user.route.js';
import questionRoutes from './src/routes/question.route.js';
import collegeRoutes from "./src/routes/collegeRoutes.js";
import codeRoutes from "./src/routes/code.route.js";
import notificationRoutes from './src/routes/notification.route.js';
import analysisRoutes from './src/routes/analysis.route.js';
import faqRoutes from './src/routes/Faq.route.js';
import reviewRoutes from './src/routes/Review.route.js';
import adminRoutes from './src/routes/admin.route.js';
import assessmentRoutes from './src/routes/assessment.route.js';
import docRoutes from './src/routes/doc.route.js';
import companyRoutes from './src/routes/company.route.js';
import Faq from './src/models/Faq.js';
import Review from './src/models/Reviews.js';


const app = express();

// trust proxy (for rate-limit/IP and secure cookies behind proxies)
app.set('trust proxy', 1);

// middleware
app.use(
	cors({
		origin: process.env.WEB_ORIGIN || 'http://localhost:5173',
		credentials: true,
		methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
		exposedHeaders: ['Content-Length','X-Request-Id']
	})
);

// security headers
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  frameguard: false, // ❌ disable default SAMEORIGIN header
}));


// logging, compression, timings
if (process.env.NODE_ENV !== 'test') {
	app.use(morgan('dev'));
}
app.use(compression());
app.use(responseTime());

// body parsing
app.use(cookieParser());
app.use(express.json({ limit: '5mb' }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Mongo
mongoose.connect(process.env.MONGO_URI, {
	maxPoolSize: 10,
	serverSelectionTimeoutMS: 5000,
	dbName: process.env.MONGO_DBNAME || undefined,
})
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB error:', err));

// basic rate limit for APIs
const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 1000,
	standardHeaders: true,
	legacyHeaders: false,
});

// routes
app.use('/auth/local', localAuth); // local login/register
app.use('/auth', oidcAuth);        // OIDC auth
app.use('/courses', apiLimiter, courseRoutes);
app.use('/docs',docRoutes);

app.use('/cart', apiLimiter, cartRoutes);
app.use('/api/user', apiLimiter, userRoutes);
app.use("/api/admin", apiLimiter, analysisRoutes);
app.use('/api/questions', apiLimiter, questionRoutes);
app.use('/api/assessments', apiLimiter, assessmentRoutes);
app.use("/api/colleges", apiLimiter, collegeRoutes);
app.use("/api/code", apiLimiter, codeRoutes);
app.use('/api/notifications', apiLimiter, notificationRoutes);
app.use('/api/companies', apiLimiter, companyRoutes);
// app.use("/api/courses", );
app.use("/api/faqs", apiLimiter, faqRoutes);
app.use("/api/reviews", apiLimiter, reviewRoutes);
app.use("/api/admin", apiLimiter, adminRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
	res.json({ 
		status: 'OK', 
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
		memory: process.memoryUsage()
	});
});

// centralized error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err, req, res, next) => {
	console.error('Unhandled error:', err);
	res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
    cors: {
        origin: process.env.WEB_ORIGIN || 'http://localhost:5173',
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    },
    path: '/socket.io',
});

// Redis adapter for scaling
(async () => {
    try {
        const redisHost = process.env.REDIS_HOST || 'redis';
        const redisPort = process.env.REDIS_PORT || 6379;

        const pubClient = createClient({
            url: `redis://${redisHost}:${redisPort}`
        });
        await pubClient.connect();

        const subClient = pubClient.duplicate();
        await subClient.connect();

        io.adapter(createAdapter(pubClient, subClient));
        console.log('✅ Redis adapter connected');
    } catch (error) {
        console.warn('⚠️ Redis connection failed, using default adapter:', error.message);
        // Continue without Redis adapter
    }
})();


// Socket.IO authentication middleware for HTTP-only cookies
io.use(async (socket, next) => {
    try {
        // Get the cookie from the handshake
        const cookieHeader = socket.handshake.headers.cookie;
        if (!cookieHeader) {
            return next(new Error('Authentication error: No cookies provided'));
        }

        // Parse cookies to find app_session
        const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
            const [key, value] = cookie.trim().split('=');
            acc[key] = value;
            return acc;
        }, {});

        const token = cookies.app_session;
        if (!token) {
            return next(new Error('Authentication error: No session cookie found'));
        }

        // Verify the JWT token from the cookie
        const decoded = jwt.verify(token, process.env.APP_JWT_SECRET, {
            issuer: process.env.APP_JWT_ISS,
            audience: process.env.APP_JWT_AUD,
        });

        const User = mongoose.model('User');
        const user = await User.findById(decoded.sub);

        if (!user) {
            return next(new Error('Authentication error: User not found'));
        }

        socket.userId = user._id.toString();
        socket.userRole = user.role;
        next();
    } catch (err) {
        next(new Error('Authentication error: Invalid session'));
    }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    // Join user to their personal room
    socket.join(`user_${socket.userId}`);

    // Join admin to admin room if they're an admin
    if (socket.userRole === 'admin') {
        socket.join('admin_room');
    }
    socket.on("joinCourse", (courseId) => {
        socket.join(courseId);
    });

    // optional: client emits newFaq, server saves and broadcasts
    socket.on("client:newFaq", async (payload) => {
        const faq = await Faq.create(payload);
        io.to(payload.courseId).emit("faq:created", faq);
    });

    socket.on("client:newReview", async (payload) => {
        const review = await Review.create(payload);
        io.to(payload.courseId).emit("review:created", review);
    });
});

// Make io available globally for notification service
global.io = io;

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running ${APP_JWT_ISS}:${PORT}`));

// graceful shutdown
process.on('SIGINT', async () => {
	console.log('Shutting down...');
	await mongoose.connection.close();
	server.close(() => process.exit(0));
});
