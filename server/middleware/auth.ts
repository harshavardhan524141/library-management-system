import { Request, Response, NextFunction } from 'express';
import { db } from '../db/database.ts';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: 'admin' | 'user';
  status: 'active' | 'deactivated';
  profile_image: string | null;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  let token = req.cookies?.lib_session;
  
  // Also support Authorization header
  const authHeader = req.headers.authorization;
  if (!token && authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  if (!token) {
    return next();
  }

  try {
    const session = db.prepare(`
      SELECT s.token, s.expires_at, u.id, u.name, u.email, u.phone, u.role, u.status, u.profile_image
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token = ? AND datetime(s.expires_at) > datetime('now')
    `).get(token) as any;

    if (session) {
      req.user = {
        id: session.id,
        name: session.name,
        email: session.email,
        phone: session.phone,
        role: session.role,
        status: session.status,
        profile_image: session.profile_image,
      };
    }
  } catch (err) {
    console.error('Session lookup error:', err);
  }

  next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }
  if (req.user.status === 'deactivated') {
    return res.status(403).json({ error: 'Your account has been deactivated. Please contact the administrator.' });
  }
  next();
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin privileges required.' });
  }
  next();
}
