import fs from 'fs/promises';
import { Request, Response } from 'express';
import multer from "multer";
import { v4 as uuid } from 'uuid';
import { detectDocumentContour } from '../cv/detectDocument.js';
import { warpDocument } from "../cv/perspective.js";
import { ensureUploadDir, getUploadPath } from '../utils/fileStorage.js';
import { db } from '../config/firebase.js';
import { pdfFirstPageToImage } from '../utils/pdfToImage.js';

ensureUploadDir();

const ALLOWED_MIMETYPES = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'application/pdf'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const upload = multer({
    dest: "uploads/tmp",
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (_req, file, callBack) => {
        if (ALLOWED_MIMETYPES.includes(file.mimetype)) {
            callBack(null, true);
        } else {
            callBack(new Error(`Invalid file type. Allowed: PNG, JPEG, PDF`));
        }
    }
});

export const uploadMiddleware = upload.single("file");

export const handleMulterError = (err: any, req: Request, res: Response, next: Function) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
        }
        return res.status(400).json({ error: err.message });
    } else if (err) {
        return res.status(400).json({ error: err.message });
    }
    next();
};

export const handleUpload = async (
    req: Request & { userId?: string },
    res: Response
) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const userId = req.userId;
        const id = uuid();
        const originalFilename = req.file.originalname;

        const originalPath = getUploadPath(`${id}-original.png`);
        const processedPath = getUploadPath(`${id}-processed.png`);

        if (req.file.mimetype === "application/pdf") {
            await pdfFirstPageToImage(req.file.path, originalPath);
            await fs.unlink(req.file.path);
        } else {
            await fs.rename(req.file.path, originalPath);
        }

        const contour = await detectDocumentContour(originalPath);

        let warning = false;

        if (contour) {
            await warpDocument(originalPath, contour, processedPath);
        } else {
            warning = true;
            await fs.copyFile(originalPath, processedPath);
        }

        const docRef = await db.collection("uploads").add({
            id,
            userId,
            filename: originalFilename,
            originalUrl: `/uploads/${id}-original.png`,
            processedUrl: `/uploads/${id}-processed.png`,
            warning,
            createdAt: new Date()
        });

        await docRef.update({ docId: docRef.id });

        res.json({
            success: true,
            id,
            docId: docRef.id,
            filename: originalFilename,
            originalUrl: `/uploads/${id}-original.png`,
            processedUrl: `/uploads/${id}-processed.png`,
            warning
        });

    } catch (error) {
        console.error('Upload error:', error);

        if (req.file?.path) {
            try {
                await fs.unlink(req.file.path);
            } catch { }
        }

        res.status(500).json({ error: "Upload failed. Please try again." });
    }
};

export const handleDelete = async (
    req: Request & { userId?: string },
    res: Response
) => {
    try {
        const rawDocId = req.params.docId;

        if (!rawDocId) {
            return res.status(400).json({ error: "Document ID required" });
        }

        const docId = Array.isArray(rawDocId)
            ? rawDocId[0]
            : rawDocId;

        const userId = req.userId;

        if (!docId) {
            return res.status(400).json({ error: "Document ID required" });
        }

        const docRef = db.collection("uploads").doc(docId);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: "Document not found" });
        }

        const data = doc.data();

        if (data?.userId !== userId) {
            return res.status(403).json({ error: "Not authorized to delete this document" });
        }

        const fileId = data?.id;

        if (fileId) {
            const originalPath = getUploadPath(`${fileId}-original.png`);
            const processedPath = getUploadPath(`${fileId}-processed.png`);

            await Promise.all([
                fs.unlink(originalPath).catch(() => { }),
                fs.unlink(processedPath).catch(() => { })
            ]);
        }

        await docRef.delete();

        res.json({ success: true, message: "Document deleted successfully" });

    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: "Delete failed. Please try again." });
    }
};
