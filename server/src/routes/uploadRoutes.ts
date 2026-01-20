import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { handleUpload, uploadMiddleware } from '../controllers/uploadController.js';
import { db } from '../config/firebase.js';

const router = Router();

router.post('/',
    requireAuth,
    uploadMiddleware,
    handleUpload
);

router.get('/', requireAuth, async (req: any, res) => {
    const snap = await db
        .collection("uploads")
        .where("userId", "==", req.userId)
        .orderBy("createdAt", "desc")
        .get();

    res.json(snap.docs.map(d => d.data()));
});

export default router;
