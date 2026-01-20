import { execFile } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export type Point2 = { x: number; y: number };

export const warpDocument = (
  imagePath: string,
  points: Point2[],
  outputPath: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.resolve(
      __dirname,
      "../../native/warp_document.py"
    );

    execFile(
      "python3",
      [
        scriptPath,
        imagePath,
        JSON.stringify(points.map(p => [p.x, p.y])),
        outputPath
      ],
      { maxBuffer: 5 * 1024 * 1024 },
      (error, _stdout, stderr) => {
        if (error) return reject(error);
        if (stderr && stderr.trim()) {
          return reject(new Error(stderr));
        }
        resolve();
      }
    );
  });
};
