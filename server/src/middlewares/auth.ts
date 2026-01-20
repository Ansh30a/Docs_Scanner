import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase.js';

export interface AuthRequest extends Request {
    userId?: string;
};

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Unauthorized!" });
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        const decoded = await auth.verifyIdToken(token);
        req.userId = decoded.uid;
        next();
    } catch (err) {
        console.error('Token verification failed:', err);
        return res.status(401).json({ error: "Invalid Token!" });
    };
};
