import { Request, Response, NextFunction } from 'express';
import jwt, { Secret, JwtPayload } from 'jsonwebtoken';
import { AdminUser } from '../models/adminUser.model';

const jwtSecret: Secret = process.env.JWT_SECRET || 'fallback-secret';

// Extend Express Request interface to include user
// Create a types directory if it doesn't exist: webApi/src/types/express/index.d.ts
/*
declare global {
  namespace Express {
    interface Request {
      user?: Partial<AdminUserAttributes>; // Use the AdminUserAttributes interface
    }
  }
}
*/
// Ensure AdminUserAttributes is imported or defined if using the above snippet in a separate file.
// For simplicity here, we'll define a local type.
type AuthenticatedUser = {
    id: number;
    email: string;
    role: 'admin' | 'editor';
};

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).send('Unauthorized: No token provided');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload & AuthenticatedUser;

    // Attach user information to the request object
    // Use a custom property like req.authUser to avoid conflicts with potential future Request.user types
    (req as any).authUser = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
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
export const roleGuard = (requiredRole: 'admin' | 'editor') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).authUser as AuthenticatedUser;

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