"use client";

import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

export type DrawAnnotation = { id: string; type: "draw"; points: { x: number; y: number }[]; color: string; size: number };
export type RectAnnotation = { id: string; type: "highlight" | "shape"; x: number; y: number; w: number; h: number; color: string; size: number };
export type ImageAnnotation = { id: string; type: "image"; x: number; y: number; w: number; h: number; src: string };
export type Annotation = DrawAnnotation | RectAnnotation | ImageAnnotation;

export interface PdfViewerProps {
  url: string;
  page: number;
  zoom: number;
  annotations: Annotation[];
  cursor?: string;
  onPdfLoaded?: (pages: number) => void;
  onMouseDown?: (x: number, y: number, cssX: number, cssY: number) => void;
  onMouseMove?: (x: number, y: number) => void;
  onMouseUp?: () => void;
  liveStroke?: { points: { x: number; y: number }[]; color: string; size: number } | null;
  liveRect?: { x: number; y: number; w: number; h: number; color: string; type: "highlight" | "shape"; size: number } | null;
}

export default function PdfViewer({
  url, page, zoom, annotations, cursor = "default",
  onPdfLoaded, onMouseDown, onMouseMove, onMouseUp,
  liveStroke, liveRect,
}: PdfViewerProps) {
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const annCanvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pdfRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

  // Load PDF
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    pdfjsLib.getDocument(url).promise
      .then((pdf) => {
        if (cancelled) return;
        pdfRef.current = pdf;
        onPdfLoaded?.(pdf.numPages);
      })
      .catch(() => { if (!cancelled) setError("Could not load PDF."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  // Render PDF page
  useEffect(() => {
    const pdf = pdfRef.current;
    const canvas = pdfCanvasRef.current;
    const ann = annCanvasRef.current;
    if (!pdf || !canvas || !ann || loading) return;

    if (renderTaskRef.current) { renderTaskRef.current.cancel(); renderTaskRef.current = null; }

    const pageNum = Math.min(Math.max(1, page), pdf.numPages);
    pdf.getPage(pageNum).then((pdfPage) => {
      const vp = pdfPage.getViewport({ scale: (zoom / 100) * dpr });
      for (const c of [canvas, ann]) {
        c.width = vp.width; c.height = vp.height;
        c.style.width = `${vp.width / dpr}px`;
        c.style.height = `${vp.height / dpr}px`;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const task = pdfPage.render({ canvasContext: ctx, viewport: vp, canvas });
      renderTaskRef.current = task;
      task.promise.then(() => { renderTaskRef.current = null; }).catch(() => {});
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, page, zoom, url]);

  // Draw annotations
  useEffect(() => {
    const canvas = annCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const drawPath = (pts: { x: number; y: number }[], color: string, size: number) => {
      if (pts.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = size * dpr;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.moveTo(pts[0].x, pts[0].y);
      pts.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
      ctx.stroke();
    };

    for (const ann of annotations) {
      if (ann.type === "draw") {
        drawPath(ann.points, ann.color, ann.size);
      } else if (ann.type === "highlight") {
        ctx.save(); ctx.globalAlpha = 0.4;
        ctx.fillStyle = ann.color;
        ctx.fillRect(ann.x * dpr, ann.y * dpr, ann.w * dpr, ann.h * dpr);
        ctx.restore();
      } else if (ann.type === "shape") {
        ctx.strokeStyle = ann.color;
        ctx.lineWidth = ann.size * dpr;
        ctx.strokeRect(ann.x * dpr, ann.y * dpr, ann.w * dpr, ann.h * dpr);
      } else if (ann.type === "image") {
        const img = new Image();
        img.onload = () => ctx.drawImage(img, ann.x * dpr, ann.y * dpr, ann.w * dpr, ann.h * dpr);
        img.src = ann.src;
      }
    }

    // Live stroke preview
    if (liveStroke && liveStroke.points.length > 1) {
      drawPath(liveStroke.points, liveStroke.color, liveStroke.size);
    }

    // Live rect preview
    if (liveRect && (liveRect.w > 2 || liveRect.h > 2)) {
      if (liveRect.type === "highlight") {
        ctx.save(); ctx.globalAlpha = 0.4;
        ctx.fillStyle = liveRect.color;
        ctx.fillRect(liveRect.x * dpr, liveRect.y * dpr, liveRect.w * dpr, liveRect.h * dpr);
        ctx.restore();
      } else {
        ctx.strokeStyle = liveRect.color;
        ctx.lineWidth = liveRect.size * dpr;
        ctx.strokeRect(liveRect.x * dpr, liveRect.y * dpr, liveRect.w * dpr, liveRect.h * dpr);
      }
    }
  }, [annotations, liveStroke, liveRect, dpr]);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,   // CSS pixels
      y: e.clientY - rect.top,
    };
  };

  if (error) return (
    <div className="flex items-center gap-2 rounded-xl border-2 border-destructive/30 bg-destructive/5 p-8 text-sm text-destructive">
      ⚠️ {error}
    </div>
  );

  return (
    <div className="relative inline-block select-none">
      {loading && (
        <div className="absolute inset-0 z-20 flex min-h-[500px] min-w-[350px] items-center justify-center rounded-xl bg-muted/80">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Loading PDF...</p>
          </div>
        </div>
      )}

      <canvas ref={pdfCanvasRef} className="block rounded-xl shadow-xl shadow-black/10" />

      <canvas
        ref={annCanvasRef}
        className="absolute inset-0 rounded-xl"
        style={{ cursor }}
        onMouseDown={(e) => { const p = getPos(e); onMouseDown?.(p.x, p.y, p.x, p.y); }}
        onMouseMove={(e) => { const p = getPos(e); onMouseMove?.(p.x, p.y); }}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      />

      {!loading && (
        <div className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-black/50 px-2.5 py-1 text-xs text-white">
          p. {page}
        </div>
      )}
    </div>
  );
}
