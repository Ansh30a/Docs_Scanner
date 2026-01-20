import fs from "fs/promises";
import { Request, Response } from "express";
import multer from "multer";
import { v4 as uuid } from "uuid";
import { detectDocumentContour } from "../cv/detectDocument";
import { warpDocument } from "../cv/perspective";
import { ensureUploadDir, getUploadPath } from "../utils/fileStorage";
import { db } from "../config/firebase";

ensureUploadDir();

const upload = multer({ dest: "uploads/tmp" });
export const uploadMiddleware = upload.single("file");

export const handleUpload = async (
  req: Request & { userId?: string },
  res: Response
) => {
  try {
    if (!req.file) {
      return res
      .status(400)
      .json(
        {
            error: "No file uploaded!!!"
        }
      );
    }

    const userId = req.userId;
    const id = uuid();

    const originalPath = getUploadPath(`${id}-original.png`);
    const processedPath = getUploadPath(`${id}-processed.png`);

    await fs.rename(req.file.path, originalPath);

    const contour = await detectDocumentContour(originalPath);

    let warning = false;

    if (contour) {
      await warpDocument(originalPath, contour, processedPath);
    } else {
      warning = true;
      await fs.copyFile(originalPath, processedPath);
    }

    await db.collection("uploads").add({
      userId,
      originalUrl: `/uploads/${id}-original.png`,
      processedUrl: `/uploads/${id}-processed.png`,
      warning,
      createdAt: new Date()
    });

    res.json({
      success: true,
      originalUrl: `/uploads/${id}-original.png`,
      processedUrl: `/uploads/${id}-processed.png`,
      warning
    });

  } catch (err) {
    console.error(err);
    res
    .status(500)
    .json(
        {
            error: "Upload failed!!!"
        }
    );
  };
};
