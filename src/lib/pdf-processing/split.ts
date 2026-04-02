import { PDFDocument } from "pdf-lib";

export interface SplitResult {
  blob: Blob;
  name: string;
}

/** Extract specific page indices (0-based) from a PDF. Returns one PDF per range. */
export async function splitPdfByPages(
  file: File,
  pageIndices: number[]
): Promise<SplitResult> {
  const bytes = await file.arrayBuffer();
  const src = await PDFDocument.load(bytes);
  const out = await PDFDocument.create();
  const copied = await out.copyPages(src, pageIndices);
  copied.forEach(p => out.addPage(p));
  const saved = await out.save();
  return {
    blob: new Blob([saved.buffer as ArrayBuffer], { type: "application/pdf" }),
    name: `split_pages_${pageIndices.map(i => i + 1).join("-")}.pdf`,
  };
}

/** Split each page into a separate PDF. Returns array of results. */
export async function splitPdfAllPages(file: File): Promise<SplitResult[]> {
  const bytes = await file.arrayBuffer();
  const src = await PDFDocument.load(bytes);
  const results: SplitResult[] = [];

  for (let i = 0; i < src.getPageCount(); i++) {
    const out = await PDFDocument.create();
    const [page] = await out.copyPages(src, [i]);
    out.addPage(page);
    const saved = await out.save();
    results.push({
      blob: new Blob([saved.buffer as ArrayBuffer], { type: "application/pdf" }),
      name: `page_${i + 1}.pdf`,
    });
  }
  return results;
}
