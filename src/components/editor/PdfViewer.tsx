"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

// ─── Types ────────────────────────────────────────────────────────────────────

export type DrawAnnotation  = { id: string; type: "draw";   points: { x: number; y: number }[]; color: string; size: number; rotation?: number; page?: number };
export type RectAnnotation  = { id: string; type: "highlight" | "shape" | "underline" | "strikethrough"; x: number; y: number; w: number; h: number; color: string; size: number; rotation?: number; page?: number };
export type ImageAnnotation = { id: string; type: "image";  x: number; y: number; w: number; h: number; src: string; rotation?: number; page?: number };
export type LineAnnotation  = { id: string; type: "line" | "arrow"; x1: number; y1: number; x2: number; y2: number; color: string; size: number; rotation?: number; page?: number };
export type Annotation      = DrawAnnotation | RectAnnotation | ImageAnnotation | LineAnnotation;

export interface LiveRect { x: number; y: number; w: number; h: number; color: string; type: "highlight" | "shape" | "underline" | "strikethrough"; size: number; }
export interface LiveLine { x1: number; y1: number; x2: number; y2: number; color: string; size: number; type: "line" | "arrow"; }

export interface TextBox { id: string; x: number; y: number; value: string; color: string; placeholder?: string; rotation?: number; page?: number; }

export interface PdfViewerProps {
  url: string;
  page: number;
  zoom: number;
  pageRotation?: number;
  annotations: Annotation[];
  textBoxes?: TextBox[];
  activeTextBoxId?: string | null;
  selectedTextBoxId?: string | null;
  selectedId?: string | null;
  cursor?: string;
  liveStroke?: { points: { x: number; y: number }[]; color: string; size: number } | null;
  liveRect?: LiveRect | null;
  liveLine?: LiveLine | null;
  onPdfLoaded?: (pages: number) => void;
  onMouseDown?: (x: number, y: number) => void;
  onMouseMove?: (x: number, y: number) => void;
  onMouseUp?: () => void;
  onTextBoxBlur?: (id: string, value: string) => void;
  onTextBoxDelete?: (id: string) => void;
  onTextBoxSelect?: (id: string) => void;
  onTextBoxMove?: (id: string, x: number, y: number) => void;
  onTextBoxActivate?: (id: string) => void;
  onRotateStart?: (id: string, cx: number, cy: number) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getBBox(ann: Annotation): { x: number; y: number; w: number; h: number } | null {
  if (ann.type === "draw") {
    if (!ann.points.length) return null;
    const xs = ann.points.map(p => p.x), ys = ann.points.map(p => p.y);
    const x = Math.min(...xs), y = Math.min(...ys);
    return { x, y, w: Math.max(...xs) - x || 10, h: Math.max(...ys) - y || 10 };
  }
  if (ann.type === "highlight" || ann.type === "shape" || ann.type === "image")
    return { x: ann.x, y: ann.y, w: ann.w, h: ann.h };
  return null;
}

export function hitTest(ann: Annotation, mx: number, my: number, pad = 8): boolean {
  const bb = getBBox(ann);
  if (!bb) return false;
  const rot = (ann.rotation ?? 0) * (Math.PI / 180);
  if (rot === 0) return mx >= bb.x - pad && mx <= bb.x + bb.w + pad && my >= bb.y - pad && my <= bb.y + bb.h + pad;
  // Rotate point into annotation's local space
  const cx = bb.x + bb.w / 2, cy = bb.y + bb.h / 2;
  const dx = mx - cx, dy = my - cy;
  const lx = dx * Math.cos(-rot) - dy * Math.sin(-rot);
  const ly = dx * Math.sin(-rot) + dy * Math.cos(-rot);
  return lx >= -bb.w / 2 - pad && lx <= bb.w / 2 + pad && ly >= -bb.h / 2 - pad && ly <= bb.h / 2 + pad;
}

// ─── Canvas helpers for rotated drawing ──────────────────────────────────────

function drawRotated(ctx: CanvasRenderingContext2D, rad: number, cx: number, cy: number, fn: () => void) {
  if (rad === 0) { fn(); return; }
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rad);
  ctx.translate(-cx, -cy);
  fn();
  ctx.restore();
}

// ─── PlacedTextBox — rendered after confirming text; draggable with pointer ───
interface PlacedTextBoxProps {
  tb: TextBox;
  isSelected: boolean;
  onSelectTb?: (id: string) => void;
  onMoveTb?: (id: string, x: number, y: number) => void;
  onActivateTb?: (id: string) => void;
  onDeleteTb?: (id: string) => void;
}
function PlacedTextBox({ tb, isSelected, onSelectTb, onMoveTb, onActivateTb, onDeleteTb }: PlacedTextBoxProps) {
  const dragging   = useRef(false);
  const startMouse = useRef({ x: 0, y: 0 });
  const startPos   = useRef({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onSelectTb?.(tb.id);
    dragging.current   = true;
    startMouse.current = { x: e.clientX, y: e.clientY };
    startPos.current   = { x: tb.x, y: tb.y };

    const onMove = (ev: MouseEvent) => {
      if (!dragging.current) return;
      onMoveTb?.(tb.id, startPos.current.x + ev.clientX - startMouse.current.x,
                        startPos.current.y + ev.clientY - startMouse.current.y);
    };
    const onUp = () => {
      dragging.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
  }, [tb.id, tb.x, tb.y, onSelectTb, onMoveTb]);

  return (
    <div
      className="absolute z-25 cursor-move select-none group"
      style={{
        left: tb.x, top: tb.y,
        color: tb.color,
        transform: tb.rotation ? `rotate(${tb.rotation}deg)` : undefined,
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={(e) => { e.stopPropagation(); onActivateTb?.(tb.id); }}
      onMouseUp={e => e.stopPropagation()}
      onMouseMove={e => e.stopPropagation()}
    >
      <div className={`min-w-[60px] rounded px-1 py-0.5 text-sm whitespace-pre-wrap font-medium leading-snug transition-shadow
        ${isSelected ? "ring-2 ring-primary ring-offset-1 shadow-sm" : "hover:ring-1 hover:ring-primary/40"}`}>
        {tb.value}
      </div>
      {isSelected && (
        <button
          className="absolute -top-2.5 -right-2.5 z-30 h-5 w-5 rounded-full bg-destructive text-white text-[11px] font-bold flex items-center justify-center shadow hover:scale-110 transition-transform"
          onMouseDown={e => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onDeleteTb?.(tb.id); }}
        >×</button>
      )}
    </div>
  );
}

// ─── TextBoxEditor ────────────────────────────────────────────────────────────
// Dedicated component so useEffect-based focus fires reliably on every mount.
interface TextBoxEditorProps {
  tb: TextBox;
  onBlur?: (id: string, value: string) => void;
  onDelete?: (id: string) => void;
}
function TextBoxEditor({ tb, onBlur, onDelete }: TextBoxEditorProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  // Reliable focus: fires on mount even inside canvas overlays
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Small delay lets React finish the render pass before focusing
    const id = requestAnimationFrame(() => {
      el.focus();
      // Move cursor to end
      const len = el.value.length;
      el.setSelectionRange(len, len);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (!val.trim()) onDelete?.(tb.id);
    else onBlur?.(tb.id, val);
  }, [tb.id, onBlur, onDelete]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      const val = e.currentTarget.value;
      if (!val.trim()) onDelete?.(tb.id);
      else { onBlur?.(tb.id, val); e.currentTarget.blur(); }
    }
    // Prevent Escape/Enter from bubbling to canvas
    e.stopPropagation();
  }, [tb.id, onBlur, onDelete]);

  return (
    <div
      className="absolute z-30"
      style={{
        left: tb.x,
        top: tb.y,
        transform: tb.rotation ? `rotate(${tb.rotation}deg)` : undefined,
      }}
      // Stop pointer events from reaching the annotation canvas below
      onMouseDown={e => e.stopPropagation()}
      onMouseUp={e => e.stopPropagation()}
      onMouseMove={e => e.stopPropagation()}
    >
      <textarea
        ref={ref}
        rows={2}
        defaultValue={tb.value}
        className="min-w-[180px] resize rounded border-2 border-primary bg-white/97 px-2.5 py-1.5 text-sm shadow-xl outline-none focus:ring-2 focus:ring-primary/40 dark:bg-neutral-900/97"
        style={{ color: tb.color, caretColor: tb.color }}
        placeholder={tb.placeholder ?? "Type here..."}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
      />
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PdfViewer({
  url, page, zoom, pageRotation = 0,
  annotations, textBoxes = [], activeTextBoxId, selectedTextBoxId, selectedId, cursor = "default",
  liveStroke, liveRect, liveLine,
  onPdfLoaded, onMouseDown, onMouseMove, onMouseUp,
  onTextBoxBlur, onTextBoxDelete, onTextBoxSelect, onTextBoxMove, onTextBoxActivate,
  onRotateStart,
}: PdfViewerProps) {
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const annCanvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const pdfRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

  // Load PDF
  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null);
    pdfjsLib.getDocument(url).promise
      .then(pdf => { if (!cancelled) { pdfRef.current = pdf; onPdfLoaded?.(pdf.numPages); } })
      .catch(() => { if (!cancelled) setError("Could not load PDF."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  // Render PDF page
  useEffect(() => {
    const pdf = pdfRef.current, canvas = pdfCanvasRef.current, ann = annCanvasRef.current;
    if (!pdf || !canvas || !ann || loading) return;
    if (renderTaskRef.current) { renderTaskRef.current.cancel(); renderTaskRef.current = null; }
    const pageNum = Math.min(Math.max(1, page), pdf.numPages);
    pdf.getPage(pageNum).then(pdfPage => {
      const vp = pdfPage.getViewport({ scale: (zoom / 100) * dpr, rotation: pageRotation % 360 });
      for (const c of [canvas, ann]) {
        c.width = vp.width; c.height = vp.height;
        c.style.width  = `${vp.width  / dpr}px`;
        c.style.height = `${vp.height / dpr}px`;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const task = pdfPage.render({ canvasContext: ctx, viewport: vp, canvas });
      renderTaskRef.current = task;
      task.promise.then(() => { renderTaskRef.current = null; }).catch(() => {});
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, page, zoom, url, pageRotation]);

  // Draw annotations + selection handles
  useEffect(() => {
    const canvas = annCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const drawPath = (pts: { x: number; y: number }[], color: string, size: number, rad: number) => {
      if (pts.length < 2) return;
      const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
      const cx = ((Math.min(...xs) + Math.max(...xs)) / 2) * dpr;
      const cy = ((Math.min(...ys) + Math.max(...ys)) / 2) * dpr;
      drawRotated(ctx, rad, cx, cy, () => {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = size * dpr;
        ctx.lineCap = "round"; ctx.lineJoin = "round";
        ctx.moveTo(pts[0].x * dpr, pts[0].y * dpr);
        pts.slice(1).forEach(p => ctx.lineTo(p.x * dpr, p.y * dpr));
        ctx.stroke();
      });
    };

    for (const ann of annotations) {
      const rad = ((ann.rotation ?? 0) * Math.PI) / 180;

      if (ann.type === "draw") {
        drawPath(ann.points, ann.color, ann.size, rad);
      } else if (ann.type === "highlight") {
        const cx = (ann.x + ann.w / 2) * dpr, cy = (ann.y + ann.h / 2) * dpr;
        drawRotated(ctx, rad, cx, cy, () => {
          ctx.save(); ctx.globalAlpha = 0.4;
          ctx.fillStyle = ann.color;
          ctx.fillRect(ann.x * dpr, ann.y * dpr, ann.w * dpr, ann.h * dpr);
          ctx.restore();
        });
      } else if (ann.type === "shape") {
        const cx = (ann.x + ann.w / 2) * dpr, cy = (ann.y + ann.h / 2) * dpr;
        drawRotated(ctx, rad, cx, cy, () => {
          ctx.strokeStyle = ann.color;
          ctx.lineWidth = ann.size * dpr;
          ctx.strokeRect(ann.x * dpr, ann.y * dpr, ann.w * dpr, ann.h * dpr);
        });
      } else if (ann.type === "underline") {
        ctx.save();
        ctx.fillStyle = ann.color;
        ctx.globalAlpha = 0.9;
        ctx.fillRect(ann.x * dpr, (ann.y + ann.h - 3) * dpr, ann.w * dpr, 3 * dpr);
        ctx.restore();
      } else if (ann.type === "strikethrough") {
        ctx.save();
        ctx.fillStyle = ann.color;
        ctx.globalAlpha = 0.9;
        ctx.fillRect(ann.x * dpr, (ann.y + ann.h / 2 - 1.5) * dpr, ann.w * dpr, 3 * dpr);
        ctx.restore();
      } else if (ann.type === "line" || ann.type === "arrow") {
        const la = ann as LineAnnotation;
        ctx.save();
        ctx.strokeStyle = la.color;
        ctx.lineWidth = la.size * dpr;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(la.x1 * dpr, la.y1 * dpr);
        ctx.lineTo(la.x2 * dpr, la.y2 * dpr);
        ctx.stroke();
        if (la.type === "arrow") {
          const angle = Math.atan2(la.y2 - la.y1, la.x2 - la.x1);
          const headLen = Math.max(14 * dpr, la.size * dpr * 4);
          ctx.beginPath();
          ctx.moveTo(la.x2 * dpr, la.y2 * dpr);
          ctx.lineTo(la.x2 * dpr - headLen * Math.cos(angle - Math.PI / 6), la.y2 * dpr - headLen * Math.sin(angle - Math.PI / 6));
          ctx.lineTo(la.x2 * dpr - headLen * Math.cos(angle + Math.PI / 6), la.y2 * dpr - headLen * Math.sin(angle + Math.PI / 6));
          ctx.closePath();
          ctx.fillStyle = la.color;
          ctx.fill();
        }
        ctx.restore();
      } else if (ann.type === "image") {
        const cx = (ann.x + ann.w / 2) * dpr, cy = (ann.y + ann.h / 2) * dpr;
        const img = new Image();
        const { x, y, w, h, src } = ann;
        const capturedCtx = ctx;
        img.onload = () => {
          drawRotated(capturedCtx, rad, cx, cy, () => {
            capturedCtx.drawImage(img, x * dpr, y * dpr, w * dpr, h * dpr);
          });
          if (ann.id === selectedId) drawSelection(capturedCtx, ann);
        };
        img.src = src;
      }

      if (ann.id === selectedId) drawSelection(ctx, ann);
    }

    function drawSelection(ctx: CanvasRenderingContext2D, ann: Annotation) {
      const bb = getBBox(ann);
      if (!bb) return;
      const PAD   = 6;
      const rad   = ((ann.rotation ?? 0) * Math.PI) / 180;
      const cx    = (bb.x + bb.w / 2) * dpr;
      const cy    = (bb.y + bb.h / 2) * dpr;
      const HANDLE_DIST = 28 * dpr; // distance of rotation handle above top

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rad);
      ctx.translate(-cx, -cy);

      const lx = (bb.x - PAD) * dpr, ly = (bb.y - PAD) * dpr;
      const lw = (bb.w + PAD * 2) * dpr, lh = (bb.h + PAD * 2) * dpr;

      // Dashed border
      ctx.strokeStyle = "#3B82F6";
      ctx.lineWidth   = 2 * dpr;
      ctx.setLineDash([6 * dpr, 3 * dpr]);
      ctx.strokeRect(lx, ly, lw, lh);
      ctx.setLineDash([]);

      // Corner handles (white square with blue border)
      const hs = 7 * dpr;
      const corners: [number, number][] = [
        [lx, ly], [lx + lw, ly], [lx, ly + lh], [lx + lw, ly + lh],
      ];
      for (const [hx, hy] of corners) {
        ctx.fillStyle = "#fff";
        ctx.strokeStyle = "#3B82F6";
        ctx.lineWidth = 1.5 * dpr;
        ctx.fillRect(hx - hs / 2, hy - hs / 2, hs, hs);
        ctx.strokeRect(hx - hs / 2, hy - hs / 2, hs, hs);
      }

      // Rotation handle (circle above top-center)
      const rhx = lx + lw / 2;
      const rhy = ly - HANDLE_DIST;
      // Stem
      ctx.strokeStyle = "#3B82F6";
      ctx.lineWidth = 1.5 * dpr;
      ctx.beginPath();
      ctx.moveTo(rhx, ly);
      ctx.lineTo(rhx, rhy + 8 * dpr);
      ctx.stroke();
      // Circle
      ctx.beginPath();
      ctx.arc(rhx, rhy, 8 * dpr, 0, Math.PI * 2);
      ctx.fillStyle = "#3B82F6";
      ctx.fill();
      // Rotation arrow icon inside
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1.5 * dpr;
      ctx.beginPath();
      ctx.arc(rhx, rhy, 4 * dpr, -Math.PI * 0.8, Math.PI * 0.8);
      ctx.stroke();

      ctx.restore();
    }

    // Live stroke
    if (liveStroke?.points && liveStroke.points.length > 1) {
      const pts = liveStroke.points;
      ctx.beginPath();
      ctx.strokeStyle = liveStroke.color;
      ctx.lineWidth = liveStroke.size * dpr;
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.moveTo(pts[0].x * dpr, pts[0].y * dpr);
      pts.slice(1).forEach(p => ctx.lineTo(p.x * dpr, p.y * dpr));
      ctx.stroke();
    }

    // Live rect
    if (liveRect && (liveRect.w > 2 || liveRect.h > 2)) {
      if (liveRect.type === "highlight") {
        ctx.save(); ctx.globalAlpha = 0.4;
        ctx.fillStyle = liveRect.color;
        ctx.fillRect(liveRect.x * dpr, liveRect.y * dpr, liveRect.w * dpr, liveRect.h * dpr);
        ctx.restore();
      } else if (liveRect.type === "underline") {
        ctx.save(); ctx.fillStyle = liveRect.color; ctx.globalAlpha = 0.9;
        ctx.fillRect(liveRect.x * dpr, (liveRect.y + liveRect.h - 3) * dpr, liveRect.w * dpr, 3 * dpr);
        ctx.restore();
      } else if (liveRect.type === "strikethrough") {
        ctx.save(); ctx.fillStyle = liveRect.color; ctx.globalAlpha = 0.9;
        ctx.fillRect(liveRect.x * dpr, (liveRect.y + liveRect.h / 2 - 1.5) * dpr, liveRect.w * dpr, 3 * dpr);
        ctx.restore();
      } else {
        ctx.strokeStyle = liveRect.color;
        ctx.lineWidth = liveRect.size * dpr;
        ctx.strokeRect(liveRect.x * dpr, liveRect.y * dpr, liveRect.w * dpr, liveRect.h * dpr);
      }
    }

    // Live line / arrow
    if (liveLine) {
      const { x1, y1, x2, y2, color, size, type: lt } = liveLine;
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = size * dpr;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(x1 * dpr, y1 * dpr);
      ctx.lineTo(x2 * dpr, y2 * dpr);
      ctx.stroke();
      if (lt === "arrow") {
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const headLen = Math.max(14 * dpr, size * dpr * 4);
        ctx.beginPath();
        ctx.moveTo(x2 * dpr, y2 * dpr);
        ctx.lineTo(x2 * dpr - headLen * Math.cos(angle - Math.PI / 6), y2 * dpr - headLen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(x2 * dpr - headLen * Math.cos(angle + Math.PI / 6), y2 * dpr - headLen * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
      }
      ctx.restore();
    }
  }, [annotations, selectedId, liveStroke, liveRect, liveLine, dpr]);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const isOnRotationHandle = (mx: number, my: number): { hit: boolean; cx: number; cy: number } => {
    if (!selectedId) return { hit: false, cx: 0, cy: 0 };
    const sel = annotations.find(a => a.id === selectedId);
    if (!sel) return { hit: false, cx: 0, cy: 0 };
    const bb = getBBox(sel);
    if (!bb) return { hit: false, cx: 0, cy: 0 };
    const PAD = 6;
    const rad = ((sel.rotation ?? 0) * Math.PI) / 180;
    // Rotation handle is at top-center of selection, 28px above
    const localX = bb.x + bb.w / 2;
    const localY = bb.y - PAD - 28;
    const cx = bb.x + bb.w / 2, cy = bb.y + bb.h / 2;
    // Rotate handle position by element rotation
    const dx = localX - cx, dy = localY - cy;
    const rhx = cx + dx * Math.cos(rad) - dy * Math.sin(rad);
    const rhy = cy + dx * Math.sin(rad) + dy * Math.cos(rad);
    const dist = Math.hypot(mx - rhx, my - rhy);
    return { hit: dist < 14, cx, cy };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getPos(e);
    const { hit, cx, cy } = isOnRotationHandle(x, y);
    if (hit && selectedId) {
      onRotateStart?.(selectedId, cx, cy);
    } else {
      onMouseDown?.(x, y);
    }
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
        onMouseDown={handleMouseDown}
        onMouseMove={e => { const p = getPos(e); onMouseMove?.(p.x, p.y); }}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      />
      {/* Text boxes: editor (active) or placed (draggable) */}
      {textBoxes.map((tb) =>
        tb.id === activeTextBoxId ? (
          <TextBoxEditor
            key={tb.id}
            tb={tb}
            onBlur={onTextBoxBlur}
            onDelete={onTextBoxDelete}
          />
        ) : (
          <PlacedTextBox
            key={tb.id}
            tb={tb}
            isSelected={tb.id === selectedTextBoxId}
            onSelectTb={onTextBoxSelect}
            onMoveTb={onTextBoxMove}
            onActivateTb={onTextBoxActivate}
            onDeleteTb={onTextBoxDelete}
          />
        )
      )}
      {!loading && (
        <div className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-black/50 px-2.5 py-1 text-xs text-white">
          p. {page}
        </div>
      )}
    </div>
  );
}
