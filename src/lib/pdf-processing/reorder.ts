import { PDFDocument } from "pdf-lib";

/** Re-order pages of a PDF. `newOrder` is an array of 0-based page indices in desired order. */
export async function reorderPdfPages(file: File, newOrder: number[]): Promise<Blob> {
  const bytes = await file.arrayBuffer();
  const src = await PDFDocument.load(bytes);
  const out = await PDFDocument.create();
  const pages = await out.copyPages(src, newOrder);
  pages.forEach(p => out.addPage(p));
  const saved = await out.save();
  return new Blob([saved.buffer as ArrayBuffer], { type: "application/pdf" });
}
