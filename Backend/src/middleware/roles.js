import jwt from "jsonwebtoken";
import User from "../models/User.js";

function extractToken(req) {
    // cookie (app_session), Authorization header, x-access-token header
    if (req.cookies && req.cookies.app_session) return req.cookies.app_session;
    const auth = req.headers && (req.headers.authorization || req.headers.Authorization);
    if (auth && typeof auth === 'string') {
        if (auth.startsWith('Bearer ')) return auth.slice(7).trim();
        return auth.trim();
    }
    if (req.headers && req.headers['x-access-token']) return req.headers['x-access-token'];
    if (req.query && req.query.token) return String(req.query.token);
    return null;
}

export async function requireAdmin(req, res, next) {
    try {
        const token = extractToken(req);
        if (!token) return res.status(401).json({ error: 'Unauthorized' });

        let payload;
        try {
            // Try verify with configured options if present, fall back to simple verify
            const verifyOptions = {};
            if (process.env.APP_JWT_ISS) verifyOptions.issuer = process.env.APP_JWT_ISS;
            if (process.env.APP_JWT_AUD) verifyOptions.audience = process.env.APP_JWT_AUD;
            payload = jwt.verify(token, process.env.APP_JWT_SECRET, verifyOptions);
        } catch (err) {
            // If verification with options fails, try without options (makes middleware tolerant)
            try {
                payload = jwt.verify(token, process.env.APP_JWT_SECRET);
            } catch (err2) {
                console.warn('JWT verify failed:', err2.message || err2);
                return res.status(401).json({ error: 'Unauthorized' });
            }
        }

        if (!payload || !payload.sub) return res.status(401).json({ error: 'Unauthorized' });

        const user = await User.findById(payload.sub);
        if (!user) return res.status(401).json({ error: 'Unauthorized' });

        // normalize role check: accept small variants like master_admin, Master_ADMIN, etc.
        const rawRole = (user.role || '').toString();
        const norm = rawRole.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const allowed = new Set(['admin', 'master_admin', 'masteradmin', 'master-admin']);
        if (!allowed.has(norm)) return res.status(403).json({ error: 'Forbidden' });

        req.user = { id: user._id, email: user.email, role: user.role };
        return next();
    } catch (err) {
        console.error('requireAdmin error:', err && (err.message || err));
        return res.status(401).json({ error: 'Unauthorized' });
    }
}

export default { requireAdmin };


