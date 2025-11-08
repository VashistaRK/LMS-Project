import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import NotificationService from "../services/notificationService.js";

const router = express.Router();

const {
    APP_JWT_SECRET,
    APP_JWT_ISS,
    APP_JWT_AUD
} = process.env;

// sign JWT
function signToken(user) {
    return jwt.sign(
        { id: user._id, email: user.email, name: user.name },
        APP_JWT_SECRET,
        { expiresIn: "15d", issuer: APP_JWT_ISS, audience: APP_JWT_AUD }
    );
}

// Register
router.post("/register", async (req, res) => {
    const { email, password, name, role } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Missing fields" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: "Email already exists" });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ email, name, passwordHash, role, provider: "local" });

    // Send notification to admins about new user registration
    try {
        await NotificationService.notifyNewUser(
            name || email,
            user._id
        );
        } catch (notificationError) {
            // Don't fail the registration if notification fails
        }

    const token = signToken(user);
    res.cookie("app_session", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 15 * 24 * 60 * 60 * 1000
    });
    res.json({ user: { id: user._id, email, name }, token });
});

// Login
router.post("/login", async (req, res) => {
    const { email, password, rememberMe } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.passwordHash)
        return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = signToken(user);

    // Decide cookie lifetime
    const cookieOptions = {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
    };

    if (rememberMe) {
        // 15 days
        cookieOptions.maxAge = 15 * 24 * 60 * 60 * 1000;
    } else {
        // Session cookie (clears on browser close)
        cookieOptions.maxAge = undefined;
    }

    res.cookie("app_session", token, cookieOptions);
    res.json({ user: { id: user._id, email, name: user.name }, token });
});


// Logout
router.post("/logout", (req, res) => {
    res.clearCookie("app_session");
    res.status(204).end();
});

export default router;
