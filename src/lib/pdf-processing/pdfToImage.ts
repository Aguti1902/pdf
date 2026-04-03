import type { PDFDocumentProxy } from "pdfjs-dist";

export interface PageImage {
  blob: Blob;
  name: string;
  page: number;
}

async function getPdfjsLib() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lib = (await import("pdfjs-dist")) as any;
  if (!lib.GlobalWorkerOptions.workerSrc) {
    lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  }
  return lib;
}

export type ImageQuality = "low" | "medium" | "high" | "ultra";

const QUALITY_SCALE: Record<ImageQuality, number> = {
  low:   1.5,
  medium: 2.5,
  high:   3.5,
  ultra:  5,
};

const QUALITY_JPEG: Record<ImageQuality, number> = {
  low: 0.80, medium: 0.90, high: 0.95, ultra: 0.98,
};

/** Convert all pages of a PDF to images. Format: "jpeg" | "png" */
export async function pdfToImages(
  file: File,
  format: "jpeg" | "png" = "jpeg",
  scale: number | ImageQuality = "high"
): Promise<PageImage[]> {
  const pdfjsLib = await getPdfjsLib();
  const bytes = await file.arrayBuffer();
  const pdf: PDFDocumentProxy = await pdfjsLib.getDocument({ data: bytes }).promise;
  const results: PageImage[] = [];
  const mimeType = format === "jpeg" ? "image/jpeg" : "image/png";
  const ext = format === "jpeg" ? "jpg" : "png";

  const resolvedScale = typeof scale === "string" ? QUALITY_SCALE[scale] : scale;
  const jpegQuality   = typeof scale === "string" ? QUALITY_JPEG[scale]  : 0.95;

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: resolvedScale });

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d")!;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (page.render as any)({ canvasContext: ctx, viewport, canvas }).promise;

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        b => b ? resolve(b) : reject(new Error("Canvas toBlob failed")),
        mimeType,
        format === "jpeg" ? jpegQuality : undefined
      );
    });

    const baseName = file.name.replace(/\.pdf$/i, "");
    results.push({ blob, name: `${baseName}_page_${i}.${ext}`, page: i });
  }

  return results;
}
