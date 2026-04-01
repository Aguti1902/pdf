"use client";

import {
  useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef,
} from "react";
import type { ToolAction } from "@/types";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Point { x: number; y: number }

type Annotation =
  | { id: string; type: "draw"; points: Point[]; color: string; size: number }
  | { id: string; type: "highlight"; x: number; y: number; w: number; h: number; color: string }
  | { id: string; type: "shape"; x: number; y: number; w: number; h: number; color: string; size: number }
  | { id: string; type: "image"; x: number; y: number; w: number; h: number; src: string };

export interface PdfViewerHandle {
  undo: () => void;
  redo: () => void;
  getAnnotationCount: () => number;
}

interface PdfViewerProps {
  url: string;
  page: number;
  zoom: number;
  activeTool: ToolAction | null;
  toolColor?: string;
  toolSize?: number;
  onPdfLoaded?: (totalPages: number) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const PdfViewer = forwardRef<PdfViewerHandle, PdfViewerProps>(function PdfViewer(
  { url, page, zoom, activeTool, toolColor = "#EF4444", toolSize = 3, onPdfLoaded },
  ref,
) {
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const annCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [history, setHistory] = useState<Annotation[][]>([[]]); // undo stack
  const [historyIdx, setHistoryIdx] = useState(0);
  const [textBoxes, setTextBoxes] = useState<{ id: string; x: number; y: number; value: string; color: string }[]>([]);

  // Refs for mouse state — avoids stale closure bugs
  const isDrawingRef = useRef(false);
  const drawPointsRef = useRef<Point[]>([]);
  const rectStartRef = useRef<Point | null>(null);
  const liveRectRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
  const pendingImagePosRef = useRef<{ x: number; y: number } | null>(null);

  const pdfRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);
  const dprRef = useRef(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1);

  // Expose undo/redo/count to parent via ref
  useImperativeHandle(ref, () => ({
    undo() {
      setHistoryIdx((i) => {
        const next = Math.max(0, i - 1);
        setAnnotations(history[next] ?? []);
        return next;
      });
    },
    redo() {
      setHistoryIdx((i) => {
        const next = Math.min(history.length - 1, i + 1);
        setAnnotations(history[next] ?? []);
        return next;
      });
    },
    getAnnotationCount: () => annotations.length,
  }), [annotations, history]);

  // Push new state to history
  const commit = useCallback((next: Annotation[]) => {
    setAnnotations(next);
    setHistory((h) => {
      const trimmed = h.slice(0, historyIdx + 1);
      return [...trimmed, next];
    });
    setHistoryIdx((i) => i + 1);
  }, [historyIdx]);

  // ── Load PDF ─────────────────────────────────────────────────────────────────
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
      .catch(() => { if (!cancelled) setError("Could not load PDF. Make sure it's a valid PDF file."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [url, onPdfLoaded]);

  // ── Render page ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (loading || !pdfRef.current) return;
    const pdf = pdfRef.current;
    const canvas = pdfCanvasRef.current;
    const annCanvas = annCanvasRef.current;
    if (!canvas || !annCanvas) return;

    if (renderTaskRef.current) { renderTaskRef.current.cancel(); renderTaskRef.current = null; }

    const dpr = dprRef.current;
    const pageNum = Math.min(Math.max(1, page), pdf.numPages);

    pdf.getPage(pageNum).then((pdfPage) => {
      const viewport = pdfPage.getViewport({ scale: (zoom / 100) * dpr });

      for (const c of [canvas, annCanvas]) {
        c.width = viewport.width;
        c.height = viewport.height;
        c.style.width = `${viewport.width / dpr}px`;
        c.style.height = `${viewport.height / dpr}px`;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const task = pdfPage.render({ canvasContext: ctx, viewport, canvas });
      renderTaskRef.current = task;
      task.promise.then(() => { renderTaskRef.current = null; }).catch(() => {});
    });
  }, [loading, page, zoom, url]);

  // ── Redraw annotations ───────────────────────────────────────────────────────
  const redraw = useCallback(() => {
    const canvas = annCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const ann of annotations) {
      if (ann.type === "draw") {
        if (ann.points.length < 2) continue;
        ctx.beginPath();
        ctx.strokeStyle = ann.color;
        ctx.lineWidth = ann.size;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.moveTo(ann.points[0].x, ann.points[0].y);
        for (const p of ann.points.slice(1)) ctx.lineTo(p.x, p.y);
        ctx.stroke();
      } else if (ann.type === "highlight") {
        ctx.save();
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = ann.color;
        ctx.fillRect(ann.x, ann.y, ann.w, ann.h);
        ctx.restore();
      } else if (ann.type === "shape") {
        ctx.beginPath();
        ctx.strokeStyle = ann.color;
        ctx.lineWidth = ann.size;
        ctx.strokeRect(ann.x, ann.y, ann.w, ann.h);
      } else if (ann.type === "image") {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, ann.x, ann.y, ann.w, ann.h);
        };
        img.src = ann.src;
      }
    }

    // Live draw preview
    if (drawPointsRef.current.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = toolColor;
      ctx.lineWidth = toolSize * dprRef.current;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.moveTo(drawPointsRef.current[0].x, drawPointsRef.current[0].y);
      for (const p of drawPointsRef.current.slice(1)) ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }

    // Live rect preview (highlight / shape)
    if (liveRectRef.current) {
      const r = liveRectRef.current;
      if (activeTool === "highlight") {
        ctx.save();
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = toolColor;
        ctx.fillRect(r.x, r.y, r.w, r.h);
        ctx.restore();
      } else {
        ctx.strokeStyle = toolColor;
        ctx.lineWidth = toolSize * dprRef.current;
        ctx.strokeRect(r.x, r.y, r.w, r.h);
      }
    }
  }, [annotations, activeTool, toolColor, toolSize]);

  useEffect(() => { redraw(); }, [redraw]);

  // ── Canvas coordinate helper ─────────────────────────────────────────────────
  const getCanvasPos = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const rect = e.currentTarget.getBoundingClientRect();
    const dpr = dprRef.current;
    return { x: (e.clientX - rect.left) * dpr, y: (e.clientY - rect.top) * dpr };
  };

  const getCssPos = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  // ── Mouse down ───────────────────────────────────────────────────────────────
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!activeTool) return;
    const cPos = getCanvasPos(e);
    const cssPos = getCssPos(e);

    if (activeTool === "draw") {
      isDrawingRef.current = true;
      drawPointsRef.current = [cPos];
    }

    if (activeTool === "highlight" || activeTool === "shapes") {
      isDrawingRef.current = true;
      rectStartRef.current = cPos;
      liveRectRef.current = { x: cPos.x, y: cPos.y, w: 0, h: 0 };
    }

    if (activeTool === "eraser") {
      isDrawingRef.current = true;
    }

    if (["add-text", "sign", "annotate", "notes", "fill-form"].includes(activeTool)) {
      const id = crypto.randomUUID();
      setTextBoxes((prev) => [
        ...prev,
        {
          id,
          x: cssPos.x,
          y: cssPos.y,
          value: activeTool === "sign" ? "Your Signature" : "",
          color: toolColor,
        },
      ]);
    }

    if (activeTool === "add-image") {
      pendingImagePosRef.current = cPos;
      imgInputRef.current?.click();
    }
  };

  // ── Mouse move ───────────────────────────────────────────────────────────────
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !activeTool) return;
    const cPos = getCanvasPos(e);

    if (activeTool === "draw") {
      drawPointsRef.current = [...drawPointsRef.current, cPos];
      redraw();
    }

    if ((activeTool === "highlight" || activeTool === "shapes") && rectStartRef.current) {
      liveRectRef.current = {
        x: Math.min(rectStartRef.current.x, cPos.x),
        y: Math.min(rectStartRef.current.y, cPos.y),
        w: Math.abs(cPos.x - rectStartRef.current.x),
        h: Math.abs(cPos.y - rectStartRef.current.y),
      };
      redraw();
    }

    if (activeTool === "eraser") {
      const radius = toolSize * dprRef.current * 10;
      const next = annotations.filter((ann) => {
        if (ann.type !== "draw") return true;
        return !ann.points.some((p) => Math.hypot(p.x - cPos.x, p.y - cPos.y) < radius);
      });
      if (next.length !== annotations.length) {
        setAnnotations(next);
      }
    }
  };

  // ── Mouse up ─────────────────────────────────────────────────────────────────
  const handleMouseUp = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    if (activeTool === "draw") {
      const pts = drawPointsRef.current;
      if (pts.length >= 2) {
        commit([...annotations, { id: crypto.randomUUID(), type: "draw", points: pts, color: toolColor, size: toolSize * dprRef.current }]);
      }
      drawPointsRef.current = [];
      redraw();
    }

    if ((activeTool === "highlight" || activeTool === "shapes") && liveRectRef.current) {
      const r = liveRectRef.current;
      if (r.w > 4 && r.h > 4) {
        if (activeTool === "highlight") {
          commit([...annotations, { id: crypto.randomUUID(), type: "highlight", x: r.x, y: r.y, w: r.w, h: r.h, color: toolColor }]);
        } else {
          commit([...annotations, { id: crypto.randomUUID(), type: "shape", x: r.x, y: r.y, w: r.w, h: r.h, color: toolColor, size: toolSize * dprRef.current }]);
        }
      }
      liveRectRef.current = null;
      rectStartRef.current = null;
      redraw();
    }

    if (activeTool === "eraser") {
      commit(annotations);
    }
  };

  // ── Image upload ─────────────────────────────────────────────────────────────
  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pendingImagePosRef.current) return;
    const pos = pendingImagePosRef.current;
    pendingImagePosRef.current = null;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const dpr = dprRef.current;
        const w = Math.min(img.width, 400) * dpr;
        const h = (img.height / img.width) * w;
        commit([...annotations, { id: crypto.randomUUID(), type: "image", x: pos.x, y: pos.y, w, h, src }]);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // ── Cursor ───────────────────────────────────────────────────────────────────
  const cursorMap: Partial<Record<ToolAction, string>> = {
    "add-text": "text", "edit-text": "text", sign: "crosshair",
    draw: "crosshair", highlight: "crosshair", eraser: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='10' stroke='%23666' stroke-width='2' fill='white' fill-opacity='0.5'/%3E%3C/svg%3E") 12 12, cell`,
    annotate: "text", notes: "text", shapes: "crosshair",
    "add-image": "copy", "fill-form": "text", pointer: "default", find: "text",
  };
  const cursor = activeTool ? (cursorMap[activeTool] ?? "default") : "default";

  if (error) return (
    <div className="flex max-w-sm items-center gap-3 rounded-xl border-2 border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
      <span>⚠️</span> {error}
    </div>
  );

  return (
    <div className="relative inline-block select-none">
      {/* Hidden image input */}
      <input ref={imgInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />

      {/* Loading spinner */}
      {loading && (
        <div className="absolute inset-0 z-20 flex min-h-[400px] min-w-[300px] items-center justify-center rounded-xl bg-muted/80">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Loading PDF...</p>
          </div>
        </div>
      )}

      {/* PDF canvas */}
      <canvas ref={pdfCanvasRef} className="block rounded-xl shadow-xl shadow-black/10" />

      {/* Annotation canvas */}
      <canvas
        ref={annCanvasRef}
        className="absolute inset-0 rounded-xl"
        style={{ cursor }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      {/* Text boxes */}
      {textBoxes.map((tb) => (
        <div key={tb.id} className="absolute z-10" style={{ left: tb.x, top: tb.y }}>
          <textarea
            autoFocus
            defaultValue={tb.value}
            rows={2}
            className="min-w-[140px] resize rounded border-2 border-primary/70 bg-white/95 px-2 py-1 text-sm shadow-lg outline-none focus:border-primary dark:bg-neutral-900/95"
            style={{ color: tb.color, fontFamily: "inherit" }}
            placeholder={tb.value ? undefined : "Type here..."}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                if (!e.currentTarget.value.trim()) {
                  setTextBoxes((prev) => prev.filter((t) => t.id !== tb.id));
                } else {
                  e.currentTarget.blur();
                }
              }
            }}
            onBlur={(e) => {
              if (!e.target.value.trim()) {
                setTextBoxes((prev) => prev.filter((t) => t.id !== tb.id));
              }
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
});

export default PdfViewer;
