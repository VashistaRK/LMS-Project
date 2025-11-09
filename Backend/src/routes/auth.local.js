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
    // Keep JWT shape consistent with OIDC flow: use `sub` and include `role` so
    // frontend `/auth/me` responses contain the role and the app can route correctly.
    return jwt.sign(
        {
            sub: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
        },
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
    // return created user info including role to be consistent with other flows
    res.json({ user: { sub: user._id, email, name, role: user.role }, token });
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
    // Build standard JSON response payload (use `sub` and include role to match /me)
    const payload = { user: { sub: user._id, email, name: user.name, role: user.role }, token };

    // If this user is an admin, include a redirect URL in the JSON so AJAX clients
    // (the frontend uses fetch) can perform a client-side navigation. Using res.redirect
    // does not cause the browser to navigate when the login request is made via fetch.
    if (user.role === "admin" || user.role === "Master_ADMIN") {
        payload.redirect = `${process.env.WEB_ORIGIN || ''}/admin`;
    }

    return res.json(payload);
});


// Logout
router.post("/logout", (req, res) => {
    res.clearCookie("app_session");
    res.status(204).end();
});

export default router;
