import { PDFDocument } from "pdf-lib";

/** Merge multiple PDF files into one. Returns a Blob. */
export async function mergePdfs(files: File[]): Promise<Blob> {
  const merged = await PDFDocument.create();

  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const src = await PDFDocument.load(bytes);
    const pages = await merged.copyPages(src, src.getPageIndices());
    pages.forEach(p => merged.addPage(p));
  }

  const out = await merged.save();
  return new Blob([out.buffer as ArrayBuffer], { type: "application/pdf" });
}
