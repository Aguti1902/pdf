"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { ToolAction } from "@/types";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Point { x: number; y: number }

interface Annotation {
  id: string;
  type: "draw" | "text" | "highlight" | "shape" | "arrow";
  points?: Point[];
  text?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  color: string;
  size: number;
  opacity?: number;
}

interface PdfViewerProps {
  url: string;
  page: number;
  zoom: number;
  activeTool: ToolAction | null;
  toolColor?: string;
  toolSize?: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PdfViewer({
  url,
  page,
  zoom,
  activeTool,
  toolColor = "#EF4444",
  toolSize = 3,
}: PdfViewerProps) {
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const annotationCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [currentDraw, setCurrentDraw] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [textBoxes, setTextBoxes] = useState<{ id: string; x: number; y: number; value: string }[]>([]);
  const [activeTextId, setActiveTextId] = useState<string | null>(null);
  const [highlightRect, setHighlightRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [highlightStart, setHighlightStart] = useState<Point | null>(null);

  const pdfRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);

  // ── Load PDF ────────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    pdfjsLib.getDocument(url).promise
      .then((pdf) => { if (!cancelled) pdfRef.current = pdf; })
      .catch(() => { if (!cancelled) setError("Could not load PDF."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [url]);

  // ── Render PDF page ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (loading || !pdfRef.current) return;

    const pdf = pdfRef.current;
    const canvas = pdfCanvasRef.current;
    const annCanvas = annotationCanvasRef.current;
    if (!canvas || !annCanvas) return;

    if (renderTaskRef.current) { renderTaskRef.current.cancel(); renderTaskRef.current = null; }

    const pageNum = Math.min(Math.max(1, page), pdf.numPages);
    pdf.getPage(pageNum).then((pdfPage) => {
      const dpr = window.devicePixelRatio || 1;
      const scale = (zoom / 100) * dpr;
      const viewport = pdfPage.getViewport({ scale });

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = `${viewport.width / dpr}px`;
      canvas.style.height = `${viewport.height / dpr}px`;

      annCanvas.width = viewport.width;
      annCanvas.height = viewport.height;
      annCanvas.style.width = `${viewport.width / dpr}px`;
      annCanvas.style.height = `${viewport.height / dpr}px`;

      setCanvasSize({ w: viewport.width, h: viewport.height });

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const task = pdfPage.render({ canvasContext: ctx, viewport, canvas });
      renderTaskRef.current = task;
      task.promise
        .then(() => { renderTaskRef.current = null; redrawAnnotations(); })
        .catch(() => {});
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, page, zoom, url]);

  // ── Redraw annotation canvas ─────────────────────────────────────────────────
  const redrawAnnotations = useCallback(() => {
    const canvas = annotationCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const ann of annotations) {
      if (ann.type === "draw" && ann.points && ann.points.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = ann.color;
        ctx.lineWidth = ann.size;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.moveTo(ann.points[0].x, ann.points[0].y);
        for (const p of ann.points.slice(1)) ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
      if (ann.type === "highlight" && ann.x !== undefined) {
        ctx.fillStyle = ann.color + "55";
        ctx.fillRect(ann.x, ann.y!, ann.width!, ann.height!);
      }
      if (ann.type === "shape" && ann.x !== undefined) {
        ctx.strokeStyle = ann.color;
        ctx.lineWidth = ann.size;
        ctx.strokeRect(ann.x, ann.y!, ann.width!, ann.height!);
      }
    }

    // live highlight rect
    if (highlightRect) {
      ctx.fillStyle = toolColor + "55";
      ctx.fillRect(highlightRect.x, highlightRect.y, highlightRect.w, highlightRect.h);
    }

    // live draw stroke
    if (currentDraw.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = toolColor;
      ctx.lineWidth = toolSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.moveTo(currentDraw[0].x, currentDraw[0].y);
      for (const p of currentDraw.slice(1)) ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
  }, [annotations, currentDraw, highlightRect, toolColor, toolSize]);

  useEffect(() => { redrawAnnotations(); }, [redrawAnnotations]);

  // ── Pointer helpers ─────────────────────────────────────────────────────────
  const getPos = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const rect = e.currentTarget.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    return {
      x: (e.clientX - rect.left) * dpr,
      y: (e.clientY - rect.top) * dpr,
    };
  };

  // ── Mouse events ────────────────────────────────────────────────────────────
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getPos(e);

    if (activeTool === "draw" || activeTool === "eraser") {
      setIsDrawing(true);
      setCurrentDraw([pos]);
    }
    if (activeTool === "highlight" || activeTool === "shapes") {
      setIsDrawing(true);
      setHighlightStart(pos);
    }
    if (activeTool === "add-text" || activeTool === "sign" || activeTool === "annotate" || activeTool === "notes") {
      const dpr = window.devicePixelRatio || 1;
      const rect = e.currentTarget.getBoundingClientRect();
      const id = crypto.randomUUID();
      setTextBoxes((prev) => [...prev, {
        id,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        value: activeTool === "sign" ? "Signature" : "",
      }]);
      setActiveTextId(id);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const pos = getPos(e);

    if (activeTool === "draw") {
      setCurrentDraw((prev) => [...prev, pos]);
    }
    if (activeTool === "eraser") {
      // erase nearby draw strokes
      setAnnotations((prev) => prev.filter((ann) => {
        if (ann.type !== "draw" || !ann.points) return true;
        return !ann.points.some(
          (p) => Math.hypot(p.x - pos.x, p.y - pos.y) < 20
        );
      }));
    }
    if ((activeTool === "highlight" || activeTool === "shapes") && highlightStart) {
      setHighlightRect({
        x: Math.min(highlightStart.x, pos.x),
        y: Math.min(highlightStart.y, pos.y),
        w: Math.abs(pos.x - highlightStart.x),
        h: Math.abs(pos.y - highlightStart.y),
      });
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (activeTool === "draw" && currentDraw.length > 1) {
      setAnnotations((prev) => [...prev, {
        id: crypto.randomUUID(),
        type: "draw",
        points: currentDraw,
        color: toolColor,
        size: toolSize,
      }]);
      setCurrentDraw([]);
    }

    if ((activeTool === "highlight" || activeTool === "shapes") && highlightRect && (highlightRect.w > 5 || highlightRect.h > 5)) {
      setAnnotations((prev) => [...prev, {
        id: crypto.randomUUID(),
        type: activeTool === "shapes" ? "shape" : "highlight",
        x: highlightRect.x,
        y: highlightRect.y,
        width: highlightRect.w,
        height: highlightRect.h,
        color: activeTool === "shapes" ? toolColor : "#FDE047",
        size: toolSize,
      }]);
      setHighlightRect(null);
      setHighlightStart(null);
    }
  };

  // ── Cursor map ──────────────────────────────────────────────────────────────
  const cursors: Partial<Record<ToolAction, string>> = {
    "add-text": "text",
    "edit-text": "text",
    sign: "crosshair",
    draw: "crosshair",
    highlight: "crosshair",
    eraser: "cell",
    annotate: "text",
    notes: "text",
    shapes: "crosshair",
    pointer: "default",
    find: "text",
    rotate: "default",
    "delete-page": "default",
  };
  const cursor = activeTool ? (cursors[activeTool] ?? "default") : "default";

  if (error) return (
    <div className="flex items-center justify-center rounded-xl border-2 border-destructive/30 bg-destructive/5 p-10 text-sm text-destructive">
      {error}
    </div>
  );

  return (
    <div ref={containerRef} className="relative inline-block select-none">
      {/* Loading spinner */}
      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-muted/80">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Loading PDF...</p>
          </div>
        </div>
      )}

      {/* PDF render canvas */}
      <canvas
        ref={pdfCanvasRef}
        className="block rounded-xl shadow-xl shadow-black/10"
      />

      {/* Annotation canvas — on top */}
      <canvas
        ref={annotationCanvasRef}
        className="absolute inset-0 rounded-xl"
        style={{ cursor }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      {/* Floating text boxes */}
      {textBoxes.map((tb) => (
        <div
          key={tb.id}
          className="absolute z-10"
          style={{ left: tb.x, top: tb.y }}
        >
          <textarea
            autoFocus={activeTextId === tb.id}
            defaultValue={tb.value}
            rows={2}
            className="min-w-[120px] resize border-2 border-primary/60 bg-yellow-50/90 px-2 py-1 text-sm shadow-md outline-none focus:border-primary dark:bg-yellow-900/40"
            placeholder="Type here..."
            style={{ fontFamily: "inherit" }}
            onBlur={(e) => {
              if (!e.target.value.trim()) {
                setTextBoxes((prev) => prev.filter((t) => t.id !== tb.id));
              }
              setActiveTextId(null);
            }}
          />
        </div>
      ))}

      {/* Page indicator */}
      {!loading && (
        <div className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2.5 py-1 text-xs text-white">
          p. {page}
        </div>
      )}
    </div>
  );
}
