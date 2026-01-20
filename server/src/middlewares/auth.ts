import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase.js';

export interface AuthRequest extends Request {
    userId?: string;
};

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split("Bearer ")[1];

    if (!token) {
        return res
        .status(401)
        .json(
            {
                error: "Unauthorized!!!"
            }
        );
    }

    try {
        const decoded = await auth.verifyIdToken(token);
        req.userId = decoded.uid;
        next();

    } catch {
        return res
        .status(401)
        .json(
            {
                error: "Invalid Token!!!"
            }
        );
    };
};
