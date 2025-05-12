import jwt from 'jsonwebtoken';
const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).send('Unauthorized: No token provided');
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, jwtSecret);
        // Attach user information to the request object
        // Use a custom property like req.authUser to avoid conflicts with potential future Request.user types
        req.authUser = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
        };
        next();
    }
    catch (error) {
        console.error('Authentication error:', error);
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).send('Unauthorized: Token expired');
        }
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).send('Unauthorized: Invalid token');
        }
        return res.status(500).send('Internal Server Error during authentication');
    }
};
// Role-based access control middleware
export const roleGuard = (requiredRole) => {
    return (req, res, next) => {
        const user = req.authUser;
        if (!user) {
            // Should have been caught by authMiddleware, but double-check
            return res.status(401).send('Unauthorized: User not authenticated');
        }
        // Admins have access to everything editors do
        if (requiredRole === 'editor' && (user.role === 'editor' || user.role === 'admin')) {
            return next();
        }
        // Only admins have access if admin role is required
        if (requiredRole === 'admin' && user.role === 'admin') {
            return next();
        }
        console.warn(`Authorization failed: User ${user.email} (role: ${user.role}) tried to access ${requiredRole} route`);
        return res.status(403).send('Forbidden: Insufficient permissions');
    };
};
//# sourceMappingURL=authMiddleware.js.map