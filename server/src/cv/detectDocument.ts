import { execFile } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export type Point2 = { x: number; y: number };

export const detectDocumentContour = (
    imagePath: string
): Promise<Point2[] | null> => {
    return new Promise((resolve, reject) => {
        const scriptPath = path.resolve(
            __dirname,
            "../../native/detect_document_contour.py"
        );

        execFile(
            "python3",
            [scriptPath, imagePath],
            { maxBuffer: 1024 * 1024 },
            (error, stdout, stderr) => {
                if (error) {
                    return reject(error);
                }

                if (stderr && stderr.trim().length > 0) {
                    const stderrLower = stderr.toLowerCase();
                    const isWarning = stderrLower.includes('warning') ||
                        stderrLower.includes('deprecat') ||
                        stderrLower.includes('futurewarning');

                    if (!isWarning) {
                        return reject(new Error(`OpenCV stderr: ${stderr}`));
                    }
                }

                try {
                    const result = JSON.parse(stdout.trim());

                    if (!result) {
                        resolve(null);
                    } else {
                        resolve(
                            result.map(([x, y]: [number, number]) => ({ x, y }))
                        );
                    }
                } catch (e) {
                    reject(e);
                }
            }
        );
    });
};
