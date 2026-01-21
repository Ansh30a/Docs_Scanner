import fs from 'fs/promises';
import { Request, Response } from 'express';
import multer from "multer";
import { v4 as uuid } from 'uuid';
import { detectDocumentContour } from '../cv/detectDocument.js';
import { warpDocument } from "../cv/perspective.js";
import { ensureUploadDir, getUploadPath } from '../utils/fileStorage.js';
import { db } from '../config/firebase.js';
import { pdfFirstPageToImage } from '../utils/pdfToImage.js';
import cloudinary from '../config/cloudinary.js';
import axios from 'axios';

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
    fileFilter: (_, file, callBack) => {
        if (ALLOWED_MIMETYPES.includes(file.mimetype)) {
            callBack(null, true);
        } else {
            callBack(new Error(`Invalid file type. Allowed: PNG, JPEG, PDF`));
        }
    }
});

export const uploadMiddleware = upload.single("file");

export const handleMulterError = (
    err: unknown,
    _req: Request,
    res: Response,
    next: Function
) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 10MB!!!' });
        }
        return res.status(400).json({ error: err.message });
    }

    if (err instanceof Error) {
        return res.status(400).json({ error: err.message });
    }

    next();
};


export const handleUpload = async (
    req: Request & { userId?: string },
    res: Response
) => {
    let tempOriginalPath: string | null = null;
    let tempProcessedPath: string | null = null;

    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const userId = req.userId;
        const id = uuid();
        const originalFilename = req.file.originalname;

        tempOriginalPath = getUploadPath(`${id}-original.png`);
        tempProcessedPath = getUploadPath(`${id}-processed.png`);

        if (req.file.mimetype === "application/pdf") {
            await pdfFirstPageToImage(req.file.path, tempOriginalPath);
            await fs.unlink(req.file.path);
        } else {
            await fs.rename(req.file.path, tempOriginalPath);
        }

        const contour = await detectDocumentContour(tempOriginalPath);

        let warning = false;

        if (contour) {
            await warpDocument(tempOriginalPath, contour, tempProcessedPath);
        } else {
            warning = true;
            await fs.copyFile(tempOriginalPath, tempProcessedPath);
        }

        const uploadToCloudinary = async (filePath: string, publicId: string) => {
            return await cloudinary.uploader.upload(filePath, {
                folder: 'docscanner',
                public_id: publicId,
                resource_type: 'image'
            });
        };

        const [originalUpload, processedUpload] = await Promise.all([
            uploadToCloudinary(tempOriginalPath, `${userId}/${id}-original`),
            uploadToCloudinary(tempProcessedPath, `${userId}/${id}-processed`)
        ]);

        await Promise.all([
            fs.unlink(tempOriginalPath),
            fs.unlink(tempProcessedPath)
        ]);

        const docRef = await db.collection("uploads").add({
            id,
            userId,
            filename: originalFilename,
            originalUrl: originalUpload.secure_url,
            processedUrl: processedUpload.secure_url,
            cloudinaryOriginalId: originalUpload.public_id,
            cloudinaryProcessedId: processedUpload.public_id,
            warning,
            createdAt: new Date()
        });

        await docRef.update({ docId: docRef.id });

        res.json({
            success: true,
            id,
            docId: docRef.id,
            filename: originalFilename,
            originalUrl: originalUpload.secure_url,
            processedUrl: processedUpload.secure_url,
            warning
        });

    } catch (error) {
        console.error('Upload error:', error);

        if (tempOriginalPath) {
            try { await fs.unlink(tempOriginalPath); } catch { }
        }
        if (tempProcessedPath) {
            try { await fs.unlink(tempProcessedPath); } catch { }
        }

        if (req.file?.path) {
            try { await fs.unlink(req.file.path); } catch { }
        }

        res.status(500).json({ error: "Upload failed. Please try again." });
    }
};

export const handleDownload = async (
    req: Request & { userId?: string },
    res: Response
) => {
    try {
        const { docId: rawDocId, type } = req.params;

        if (typeof rawDocId !== 'string') {
            return res.status(400).json({ error: 'Invalid document ID' });
        }

        const docId = rawDocId;

        if (type !== 'original' && type !== 'processed') {
            return res.status(400).json({ error: 'Invalid download type' });
        }

        const docRef = db.collection('uploads').doc(docId);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return res.status(404).json({ error: 'Document not found' });
        }

        const data = docSnap.data();

        if (!data) {
            return res.status(404).json({ error: 'Document not found' });
        }

        if (data.userId !== req.userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }


        const fileUrl =
            type === 'original'
                ? data.originalUrl
                : data.processedUrl;

        if (!fileUrl) {
            return res.status(404).json({ error: 'File not found' });
        }

        const filenameBase =
            (data.filename ?? 'document').replace(/\.[^/.]+$/, '');

        const downloadName = `${filenameBase}-${type}.png`;

        const response = await axios.get(fileUrl, {
            responseType: 'stream'
        });

        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${downloadName}"`
        );
        res.setHeader('Content-Type', 'image/png');

        response.data.pipe(res);

    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ error: 'Download failed' });
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

        if (data?.cloudinaryOriginalId && data?.cloudinaryProcessedId) {
            await Promise.all([
                cloudinary.uploader.destroy(data.cloudinaryOriginalId),
                cloudinary.uploader.destroy(data.cloudinaryProcessedId)
            ]);
        }

        await docRef.delete();

        res.json({ success: true, message: "Document deleted successfully" });

    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: "Delete failed. Please try again." });
    }
};
