import type { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../lib/jwt';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized - No token provided' });
  }

  try {
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized - Invalid token format' });
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    return next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('jwt expired')) {
        return res.status(401).json({ message: 'Token expired' });
      }
      if (error.message.includes('invalid token')) {
        return res.status(401).json({ message: 'Invalid token' });
      }
    }
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

// Middleware to check if user has specific role
export const roleMiddleware = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden - Required roles: ${allowedRoles.join(', ')}`,
      });
    }

    return next();
  };
};
