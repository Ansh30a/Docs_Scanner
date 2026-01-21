import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { handleUpload, uploadMiddleware, handleMulterError, handleDelete } from '../controllers/uploadController.js';
import { db } from '../config/firebase.js';
import { handleDownload } from '../controllers/uploadController.js';

const router = Router();

router.post('/',
    requireAuth,
    uploadMiddleware,
    handleMulterError,
    handleUpload
);

router.get('/', requireAuth, async (req: any, res) => {
    try {
        const snap = await db
            .collection("uploads")
            .where("userId", "==", req.userId)
            .orderBy("createdAt", "desc")
            .get();

        const uploads = snap.docs.map(doc => ({
            docId: doc.id,
            ...doc.data()
        }));

        res.json(uploads);
    } catch (error) {
        console.error('Get uploads error:', error);
        res.status(500).json({ error: "Failed to fetch uploads" });
    }
});

router.get(
    '/:docId/download/:type',
    requireAuth,
    handleDownload
);

router.delete('/:docId', requireAuth, handleDelete);

export default router;
