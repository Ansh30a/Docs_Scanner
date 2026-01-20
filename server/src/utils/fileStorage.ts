import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const TMP_DIR = path.join(UPLOAD_DIR, 'tmp');

export const ensureUploadDir = () => {
    [UPLOAD_DIR, TMP_DIR].forEach(dir => {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });
};

export const getUploadPath = (filename: string) => path.join(UPLOAD_DIR, filename);