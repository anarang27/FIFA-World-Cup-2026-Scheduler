/* ───────────────────────────────────────────────
   Auth Middleware — verify JWT on protected routes
   ─────────────────────────────────────────────── */

const jwt = require('jsonwebtoken');

/**
 * Verifies the Authorization header and attaches req.user
 */
function requireAuth(req, res, next) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    const token = header.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;          // { userid, email, role }
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

/**
 * Requires the user to have the 'admin' role
 */
function requireAdmin(req, res, next) {
    requireAuth(req, res, () => {
        if (req.user.role?.toLowerCase() !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        next();
    });
}

module.exports = { requireAuth, requireAdmin };
