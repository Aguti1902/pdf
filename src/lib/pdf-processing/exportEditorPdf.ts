/**
 * Flattens editor annotations into the PDF:
 * renders each page with pdfjs, draws annotations & text boxes on top,
 * then assembles a new PDF with pdf-lib.
 *
 * Coordinate convention:
 *   Annotations are stored in CSS-pixel space at the zoom level they were created.
 *   We assume zoom=100% (scale=1) so annotation.x × EXPORT_SCALE = export canvas pixel.
 *   This is correct for the default zoom; minor offset possible if user drew at a different zoom.
 */

export interface ExportAnnotation {
  id: string;
  type: "draw" | "highlight" | "shape" | "image";
  page?: number;
  rotation?: number;
  // draw
  points?: { x: number; y: number }[];
  color?: string;
  size?: number;
  // rect / highlight / shape
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  // image
  src?: string;
}

export interface ExportTextBox {
  id: string;
  x: number;
  y: number;
  value: string;
  color: string;
  rotation?: number;
  page?: number;
}

export interface ExportOptions {
  pdfFile: File;
  annotations: ExportAnnotation[];
  textBoxes: ExportTextBox[];
  /** Page rotation in degrees (applied to all pages for now) */
  pageRotation: number;
  /** Pages that were deleted in the editor (1-indexed) */
  deletedPages: Set<number>;
}

const EXPORT_SCALE = 2.5;

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawAnnotationsOnCtx(
  ctx: CanvasRenderingContext2D,
  anns: ExportAnnotation[],
  scale: number,
): Promise<void>[] {
  const imagePromises: Promise<void>[] = [];

  for (const ann of anns) {
    const rad = ((ann.rotation ?? 0) * Math.PI) / 180;

    if (ann.type === "draw" && ann.points && ann.points.length >= 2) {
      ctx.save();
      const cx = ((Math.min(...ann.points.map(p => p.x)) + Math.max(...ann.points.map(p => p.x))) / 2) * scale;
      const cy = ((Math.min(...ann.points.map(p => p.y)) + Math.max(...ann.points.map(p => p.y))) / 2) * scale;
      if (rad !== 0) { ctx.translate(cx, cy); ctx.rotate(rad); ctx.translate(-cx, -cy); }
      ctx.beginPath();
      ctx.strokeStyle = ann.color ?? "#000";
      ctx.lineWidth = (ann.size ?? 2) * scale;
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.moveTo(ann.points[0].x * scale, ann.points[0].y * scale);
      ann.points.slice(1).forEach(p => ctx.lineTo(p.x * scale, p.y * scale));
      ctx.stroke();
      ctx.restore();

    } else if (ann.type === "highlight" && ann.x !== undefined) {
      ctx.save();
      const cx = (ann.x + (ann.w ?? 0) / 2) * scale, cy = (ann.y! + (ann.h ?? 0) / 2) * scale;
      if (rad !== 0) { ctx.translate(cx, cy); ctx.rotate(rad); ctx.translate(-cx, -cy); }
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = ann.color ?? "#FFFF00";
      ctx.fillRect(ann.x * scale, ann.y! * scale, (ann.w ?? 0) * scale, (ann.h ?? 0) * scale);
      ctx.restore();

    } else if (ann.type === "shape" && ann.x !== undefined) {
      ctx.save();
      const cx = (ann.x + (ann.w ?? 0) / 2) * scale, cy = (ann.y! + (ann.h ?? 0) / 2) * scale;
      if (rad !== 0) { ctx.translate(cx, cy); ctx.rotate(rad); ctx.translate(-cx, -cy); }
      ctx.strokeStyle = ann.color ?? "#000";
      ctx.lineWidth = (ann.size ?? 2) * scale;
      ctx.strokeRect(ann.x * scale, ann.y! * scale, (ann.w ?? 0) * scale, (ann.h ?? 0) * scale);
      ctx.restore();

    } else if (ann.type === "image" && ann.src && ann.x !== undefined) {
      const p = loadImage(ann.src).then(img => {
        ctx.save();
        const cx = (ann.x! + (ann.w ?? 0) / 2) * scale, cy = (ann.y! + (ann.h ?? 0) / 2) * scale;
        if (rad !== 0) { ctx.translate(cx, cy); ctx.rotate(rad); ctx.translate(-cx, -cy); }
        ctx.drawImage(img, ann.x! * scale, ann.y! * scale, (ann.w ?? 0) * scale, (ann.h ?? 0) * scale);
        ctx.restore();
      }).catch(() => {/* ignore broken image */});
      imagePromises.push(p);
    }
  }

  return imagePromises;
}

function drawTextBoxesOnCtx(
  ctx: CanvasRenderingContext2D,
  boxes: ExportTextBox[],
  scale: number,
) {
  for (const tb of boxes) {
    if (!tb.value?.trim()) continue;
    ctx.save();
    const fontSize = 14 * scale;
    ctx.font = `${fontSize}px Inter, Arial, sans-serif`;
    ctx.fillStyle = tb.color || "#000000";
    const lineHeight = 18 * scale;
    const lines = tb.value.split("\n");
    if (tb.rotation) {
      const cx = tb.x * scale, cy = tb.y * scale;
      ctx.translate(cx, cy);
      ctx.rotate((tb.rotation * Math.PI) / 180);
      ctx.translate(-cx, -cy);
    }
    lines.forEach((line, i) => {
      ctx.fillText(line, tb.x * scale, (tb.y + 14 + i * 18) * scale);
    });
    ctx.restore();
  }
}

export async function exportEditorPdf(opts: ExportOptions): Promise<Blob> {
  const { pdfFile, annotations, textBoxes, pageRotation, deletedPages } = opts;

  const [pdfjsModule, { PDFDocument }] = await Promise.all([
    import("pdfjs-dist") as Promise<typeof import("pdfjs-dist")>,
    import("pdf-lib"),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfjsLib = pdfjsModule as any;
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  }

  const bytes = await pdfFile.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
  const newPdf = await PDFDocument.create();

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    if (deletedPages.has(pageNum)) continue;

    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: EXPORT_SCALE, rotation: pageRotation % 360 });

    const canvas = document.createElement("canvas");
    canvas.width  = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) continue;

    // Render the PDF page
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;

    // Annotations for this specific page (fall back to page 1 for legacy annotations without page)
    const pageAnns  = annotations.filter(a => (a.page ?? 1) === pageNum);
    const pageBoxes = textBoxes.filter(tb => (tb.page ?? 1) === pageNum);

    // Draw annotations (collect image promises so we can await them)
    const imagePromises = drawAnnotationsOnCtx(ctx, pageAnns, EXPORT_SCALE);
    await Promise.all(imagePromises);

    // Draw text boxes
    drawTextBoxesOnCtx(ctx, pageBoxes, EXPORT_SCALE);

    // Convert canvas to PNG bytes
    const pngBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(b => b ? resolve(b) : reject(new Error("toBlob failed")), "image/png");
    });
    const pngBytes  = new Uint8Array(await pngBlob.arrayBuffer());
    const pngImage  = await newPdf.embedPng(pngBytes);
    const newPage   = newPdf.addPage([viewport.width, viewport.height]);
    newPage.drawImage(pngImage, { x: 0, y: 0, width: viewport.width, height: viewport.height });
  }

  const outBytes = await newPdf.save();
  return new Blob([outBytes.buffer as ArrayBuffer], { type: "application/pdf" });
}
