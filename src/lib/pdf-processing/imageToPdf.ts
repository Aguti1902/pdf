import { PDFDocument } from "pdf-lib";

/** Convert one or more image files (JPG, PNG) into a single PDF. */
export async function imagesToPdf(files: File[]): Promise<Blob> {
  const doc = await PDFDocument.create();

  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const mime = file.type;

    let img;
    if (mime === "image/jpeg" || mime === "image/jpg") {
      img = await doc.embedJpg(bytes);
    } else if (mime === "image/png") {
      img = await doc.embedPng(bytes);
    } else {
      // Try JPEG as fallback
      img = await doc.embedJpg(bytes);
    }

    const page = doc.addPage([img.width, img.height]);
    page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
  }

  const out = await doc.save();
  return new Blob([out.buffer as ArrayBuffer], { type: "application/pdf" });
}
