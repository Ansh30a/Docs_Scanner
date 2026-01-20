import { createCanvas } from 'canvas';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';

export const pdfFirstPageToImage = async (
    pdfPath: string,
    outputPath: string
) => {
    const data = new Uint8Array(fs.readFileSync(pdfPath));
    const pdf = await pdfjs.getDocument({ data }).promise;
    const page = await pdf.getPage(1);

    const viewport = page.getViewport({ scale: 2 });
    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext("2d");

    await page.render({ canvasContext: context as any, viewport, canvas: canvas as any }).promise;

    fs.writeFileSync(outputPath, canvas.toBuffer("image/png"));
};
