import { PDFDocument } from "pdf-lib";

/**
 * Compress a PDF by re-saving it with pdf-lib (removes redundant data).
 * For more aggressive compression you'd need server-side tools (Ghostscript).
 */
export async function compressPdf(file: File): Promise<Blob> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });

  // Re-save — pdf-lib strips some unused objects and normalises structure
  const out = await doc.save({ useObjectStreams: true });
  return new Blob([out.buffer as ArrayBuffer], { type: "application/pdf" });
}
