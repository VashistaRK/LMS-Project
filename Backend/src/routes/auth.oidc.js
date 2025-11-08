// routes/auth.js
import express from "express";
import jwt from "jsonwebtoken";
import { Issuer, generators, custom } from "openid-client";
import User from "../models/User.js";

custom.setHttpOptionsDefaults({ timeout: 50000 });

const router = express.Router();
let oidcClient;

// lazy init OIDC client
async function getClient() {
    if (oidcClient) return oidcClient;
    try {
        const issuer = await Issuer.discover(process.env.OIDC_ISSUER);

        oidcClient = new issuer.Client({
            client_id: process.env.OIDC_CLIENT_ID,
            client_secret: process.env.OIDC_CLIENT_SECRET,
            redirect_uris: [process.env.OIDC_REDIRECT_URI],
            response_types: ["code"],
        });
        return oidcClient;
    } catch (err) {
        throw err;
    }
}

// helpers
function signAppJwt(claims) {
    return jwt.sign(claims, process.env.APP_JWT_SECRET, {
        algorithm: "HS256",
        expiresIn: "15d",
        issuer: process.env.APP_JWT_ISS,
        audience: process.env.APP_JWT_AUD,
    });
}

function setTempCookie(res, name, value) {
    res.cookie(name, value, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/auth",
        maxAge: 15 * 60 * 1000, // 15 minutes (short-lived for PKCE)
    });
}

function clearTempCookie(res, name) {
    res.clearCookie(name, { path: "/auth" });
}

// 🔒 Auth middleware
export function requireAuth(req, res, next) {
    const token = req.cookies?.app_session;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
        const payload = jwt.verify(token, process.env.APP_JWT_SECRET, {
            issuer: process.env.APP_JWT_ISS,
            audience: process.env.APP_JWT_AUD,
        });
        req.user = payload; // attach decoded user
        next();
    } catch {
        return res.status(401).json({ error: "Invalid token" });
    }
}

// login
router.get("/login", async (req, res) => {
    const client = await getClient();
    const codeVerifier = generators.codeVerifier();
    const codeChallenge = generators.codeChallenge(codeVerifier);
    const state = generators.state();
    const nonce = generators.nonce();

    setTempCookie(res, "oauth_state", state);
    setTempCookie(res, "oauth_code_verifier", codeVerifier);
    setTempCookie(res, "oauth_nonce", nonce);

    const url = client.authorizationUrl({
        scope: "openid profile email",
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
        state,
        nonce,
    });

    res.redirect(url);
});

// callback
router.get("/callback", async (req, res) => {
    try {
        const client = await getClient();
        const params = client.callbackParams(req);

        const state = req.cookies?.oauth_state;
        const codeVerifier = req.cookies?.oauth_code_verifier;
        const nonce = req.cookies?.oauth_nonce;

        if (!state || state !== params.state) {
            return res.status(400).send("Bad state");
        }

        const tokenSet = await client.callback(
            process.env.OIDC_REDIRECT_URI,
            params,
            { code_verifier: codeVerifier, state, nonce }
        );

        const claims = tokenSet.claims();

        // find or create user in MongoDB
        let user = await User.findOne({ email: claims.email });
        if (!user) {
            user = await User.create({
                email: claims.email,
                name: claims.name,
                provider: claims.iss,
                role: "student", // default role
                picture: claims.picture, // OIDC standard claim
                lastLogin: new Date(),
            });
        } else {
            user.lastLogin = new Date();
            await user.save();
        }

        // include role in JWT
        const appJwt = signAppJwt({
            sub: user._id,
            email: user.email,
            name: user.name,
            provider_iss: claims.iss,
            role: user.role,
            picture: claims.picture,
        });

        res.cookie("app_session", appJwt, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });

        // clear PKCE cookies
        clearTempCookie(res, "oauth_state");
        clearTempCookie(res, "oauth_code_verifier");
        clearTempCookie(res, "oauth_nonce");

        // Optional: redirect based on role
        if (user.role === "admin" || user.role === "Master_ADMIN") {
            return res.redirect(`${process.env.WEB_ORIGIN}/admin`);
        }

        res.redirect(process.env.WEB_ORIGIN || "/");
    } catch (err) {
        res.status(401).send("Login failed");
    }
});

// whoami
router.get("/me", (req, res) => {
    const token = req.cookies?.app_session;
    if (!token) return res.json({ user: null });

    try {
        const payload = jwt.verify(token, process.env.APP_JWT_SECRET, {
            issuer: process.env.APP_JWT_ISS,
            audience: process.env.APP_JWT_AUD,
        });
        res.json({ user: payload });
    } catch {
        res.json({ user: null });
    }
});

// logout
router.post("/logout", async (req, res) => {
    res.clearCookie("app_session", { path: "/" });

    try {
        const client = await getClient();
        const endSessionUrl = client.endSessionUrl({
            post_logout_redirect_uri: process.env.WEB_ORIGIN,
        });
        return res.redirect(endSessionUrl);
    } catch {
        // fallback: just clear local session
        return res.status(204).end();
    }
});

// Example protected route
router.get("/admin/secret", requireAuth, (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
    }
    res.json({ message: "Welcome Admin 🚀" });
});

export default router;
