// src/middleware/auth.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export default async function authMiddleware(req, res, next) {
    try {
        // console.log("Cookies:", req.cookies);              // 👈 debug
        // console.log("Token:", req.cookies?.app_session);   // 👈 debug
        const token = req.cookies.app_session;
        if (!token) return res.status(401).json({ error: "Unauthorized" });

        const payload = jwt.verify(token, process.env.APP_JWT_SECRET);
        const user = await User.findById(payload.sub);
        if (!user) return res.status(401).json({ error: "Unauthorized" });

        req.user = { id: user._id, email: user.email, role: user.role };
        next();
    } catch (err) {
        res.status(401).json({ error: "Unauthorized" });
    }
}

export function auth(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
            id: decoded.sub,      // match frontend user id
            name: decoded.name,   // optional
            email: decoded.email, // optional
        };
        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid token" });
    }
}
