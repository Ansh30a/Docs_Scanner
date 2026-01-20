import { Router } from 'express';
import { requireAuth } from '../middlewares/auth';
import { handleUpload, uploadMiddleware } from '../controllers/uploadController';

const router = Router();

router.post('/',
    requireAuth,
    uploadMiddleware,
    handleUpload
);

export default router;
