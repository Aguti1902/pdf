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
  type: "draw" | "highlight" | "shape" | "ellipse" | "triangle" | "diamond" | "image" | "underline" | "strikethrough" | "line" | "arrow";
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
  // line / arrow
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
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

/** A native-text edit to apply during export */
export interface ExportTextEdit {
  id: string;
  page: number;
  originalText: string;
  newText: string;
  pdfX: number;
  pdfY: number;
  pdfFontSize: number;
  pdfWidth: number;
  fontFamily?: string;
  fontWeight?: "normal" | "bold";
  fontStyle?: "normal" | "italic";
  color?: string;
}

export interface ExportOptions {
  pdfFile: File;
  annotations: ExportAnnotation[];
  textBoxes: ExportTextBox[];
  textEdits?: ExportTextEdit[];
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

    } else if (ann.type === "ellipse" && ann.x !== undefined) {
      ctx.save();
      const cx2 = (ann.x + (ann.w ?? 0) / 2) * scale, cy2 = (ann.y! + (ann.h ?? 0) / 2) * scale;
      if (rad !== 0) { ctx.translate(cx2, cy2); ctx.rotate(rad); ctx.translate(-cx2, -cy2); }
      ctx.strokeStyle = ann.color ?? "#000";
      ctx.lineWidth = (ann.size ?? 2) * scale;
      ctx.beginPath();
      ctx.ellipse(cx2, cy2, ((ann.w ?? 0) / 2) * scale, ((ann.h ?? 0) / 2) * scale, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

    } else if (ann.type === "triangle" && ann.x !== undefined) {
      ctx.save();
      const cx3 = (ann.x + (ann.w ?? 0) / 2) * scale, cy3 = (ann.y! + (ann.h ?? 0) / 2) * scale;
      if (rad !== 0) { ctx.translate(cx3, cy3); ctx.rotate(rad); ctx.translate(-cx3, -cy3); }
      ctx.strokeStyle = ann.color ?? "#000";
      ctx.lineWidth = (ann.size ?? 2) * scale;
      ctx.beginPath();
      ctx.moveTo(cx3,                                ann.y! * scale);
      ctx.lineTo((ann.x + (ann.w ?? 0)) * scale,    (ann.y! + (ann.h ?? 0)) * scale);
      ctx.lineTo(ann.x * scale,                     (ann.y! + (ann.h ?? 0)) * scale);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();

    } else if (ann.type === "diamond" && ann.x !== undefined) {
      ctx.save();
      const cx4 = (ann.x + (ann.w ?? 0) / 2) * scale, cy4 = (ann.y! + (ann.h ?? 0) / 2) * scale;
      if (rad !== 0) { ctx.translate(cx4, cy4); ctx.rotate(rad); ctx.translate(-cx4, -cy4); }
      ctx.strokeStyle = ann.color ?? "#000";
      ctx.lineWidth = (ann.size ?? 2) * scale;
      ctx.beginPath();
      ctx.moveTo(cx4,                                ann.y! * scale);
      ctx.lineTo((ann.x + (ann.w ?? 0)) * scale,    cy4);
      ctx.lineTo(cx4,                               (ann.y! + (ann.h ?? 0)) * scale);
      ctx.lineTo(ann.x * scale,                      cy4);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();

    } else if (ann.type === "underline" && ann.x !== undefined) {
      ctx.save();
      ctx.fillStyle = ann.color ?? "#1d4ed8";
      ctx.globalAlpha = 0.9;
      ctx.fillRect(ann.x * scale, (ann.y! + ann.h! - 3) * scale, (ann.w ?? 0) * scale, 3 * scale);
      ctx.restore();

    } else if (ann.type === "strikethrough" && ann.x !== undefined) {
      ctx.save();
      ctx.fillStyle = ann.color ?? "#ef4444";
      ctx.globalAlpha = 0.9;
      ctx.fillRect(ann.x * scale, (ann.y! + (ann.h ?? 0) / 2 - 1.5) * scale, (ann.w ?? 0) * scale, 3 * scale);
      ctx.restore();

    } else if ((ann.type === "line" || ann.type === "arrow") && ann.x1 !== undefined) {
      ctx.save();
      ctx.strokeStyle = ann.color ?? "#000";
      ctx.lineWidth = (ann.size ?? 2) * scale;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(ann.x1 * scale, ann.y1! * scale);
      ctx.lineTo(ann.x2! * scale, ann.y2! * scale);
      ctx.stroke();
      if (ann.type === "arrow") {
        const angle = Math.atan2(ann.y2! - ann.y1!, ann.x2! - ann.x1!);
        const headLen = Math.max(14 * scale, (ann.size ?? 2) * scale * 4);
        ctx.beginPath();
        ctx.moveTo(ann.x2! * scale, ann.y2! * scale);
        ctx.lineTo(ann.x2! * scale - headLen * Math.cos(angle - Math.PI / 6), ann.y2! * scale - headLen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(ann.x2! * scale - headLen * Math.cos(angle + Math.PI / 6), ann.y2! * scale - headLen * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fillStyle = ann.color ?? "#000";
        ctx.fill();
      }
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
  const { pdfFile, annotations, textBoxes, textEdits = [], pageRotation, deletedPages } = opts;

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

    // Apply native text edits: cover original text + write new text
    const pageEdits = textEdits.filter(e => e.page === pageNum);
    if (pageEdits.length > 0) {
      // Pre-load Google Fonts needed for this page's edits
      const { loadGoogleFont } = await import("@/lib/pdf-fonts");
      const fontFamilies = new Set<string>();
      for (const edit of pageEdits) {
        const fam = edit.fontFamily || "";
        // Extract the Google Font family name from CSS like '"Inter", sans-serif'
        const match = fam.match(/"([^"]+)"/);
        if (match) fontFamilies.add(match[1]);
      }
      await Promise.all([...fontFamilies].map(f => loadGoogleFont(f)));

      for (const edit of pageEdits) {
        if (!edit.newText) continue;

        const [blX, blY] = viewport.convertToViewportPoint(edit.pdfX, edit.pdfY);
        const [trX, trY] = viewport.convertToViewportPoint(
          edit.pdfX + edit.pdfWidth,
          edit.pdfY + edit.pdfFontSize,
        );

        const left   = Math.min(blX, trX);
        const top    = Math.min(blY, trY);
        const right  = Math.max(blX, trX);
        const bottom = Math.max(blY, trY);
        const width  = right - left;
        const height = bottom - top;

        // Cover original text
        ctx.save();
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(left - 2, top - 2, width + 4, height + 4);

        // Rebuild font string with exact PDF size
        const exportFontSize = edit.pdfFontSize * EXPORT_SCALE;
        const fStyle  = edit.fontStyle  === "italic" ? "italic "  : "";
        const fWeight = edit.fontWeight === "bold"   ? "bold "    : "";
        const fFamily = edit.fontFamily || "sans-serif";

        ctx.font         = `${fStyle}${fWeight}${exportFontSize}px ${fFamily}`;
        ctx.fillStyle    = edit.color || "#000000";
        ctx.textBaseline = "alphabetic";
        ctx.fillText(edit.newText, blX, blY);
        ctx.restore();
      }
    }

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
