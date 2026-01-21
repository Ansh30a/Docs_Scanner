import { createCanvas, CanvasRenderingContext2D } from 'canvas';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';

class NodeCanvasFactory {
    create(width: number, height: number) {
        const canvas = createCanvas(width, height);
        const context = canvas.getContext('2d') as CanvasRenderingContext2D;

        return {
            canvas,
            context
        };
    }

    reset(canvasAndContext: any, width: number, height: number) {
        canvasAndContext.canvas.width = width;
        canvasAndContext.canvas.height = height;
    }

    destroy(canvasAndContext: any) {
        canvasAndContext.canvas.width = 0;
        canvasAndContext.canvas.height = 0;
        canvasAndContext.canvas = null;
        canvasAndContext.context = null;
    }
}

export const pdfFirstPageToImage = async (
    pdfPath: string,
    outputPath: string
) => {
    const data = new Uint8Array(fs.readFileSync(pdfPath));

    const pdf = await pdfjs.getDocument({
        data,
        useSystemFonts: true
    } as any).promise;

    const page = await pdf.getPage(1);

    const viewport = page.getViewport({ scale: 2 });
    const canvasFactory = new NodeCanvasFactory();
    const { canvas, context } = canvasFactory.create(
        viewport.width,
        viewport.height
    );

    await page.render({
        canvasContext: context as any,
        viewport,
        canvasFactory
    } as any).promise;

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);

    canvasFactory.destroy({ canvas, context });
};
