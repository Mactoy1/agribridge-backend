import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export const signToken = (payload: object) =>
  jwt.sign(payload, env.jwtSecret, { expiresIn: '7d' });

export const verifyToken = (token: string) =>
  jwt.verify(token, env.jwtSecret) as { id: string; email: string; role: string };
