"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { ToolAction } from "@/types";

// Configure PDF.js worker — served locally for reliability
import * as pdfjsLib from "pdfjs-dist";
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

interface PdfViewerProps {
  url: string;
  page: number;
  zoom: number;
  activeTool: ToolAction | null;
}

export default function PdfViewer({ url, page, zoom, activeTool }: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const pdfRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);

  // Load PDF document
  useEffect(() => {
    let cancelled = false;

    async function loadPdf() {
      setLoading(true);
      setError(null);
      try {
        const loadingTask = pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;
        if (!cancelled) {
          pdfRef.current = pdf;
          setTotalPages(pdf.numPages);
        }
      } catch (e) {
        if (!cancelled) setError("Could not load PDF. Make sure it's a valid PDF file.");
        console.error("[PdfViewer] load error:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPdf();
    return () => { cancelled = true; };
  }, [url]);

  // Render page
  const renderPage = useCallback(async () => {
    const pdf = pdfRef.current;
    const canvas = canvasRef.current;
    if (!pdf || !canvas) return;

    // Cancel any in-flight render
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
      renderTaskRef.current = null;
    }

    try {
      const pageNum = Math.min(Math.max(1, page), pdf.numPages);
      const pdfPage = await pdf.getPage(pageNum);
      const scale = zoom / 100;
      const viewport = pdfPage.getViewport({ scale: scale * window.devicePixelRatio });

      // Set canvas size for high-DPI rendering
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = `${viewport.width / window.devicePixelRatio}px`;
      canvas.style.height = `${viewport.height / window.devicePixelRatio}px`;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const task = pdfPage.render({ canvasContext: ctx, viewport, canvas });
      renderTaskRef.current = task;
      await task.promise;
      renderTaskRef.current = null;
    } catch (e: unknown) {
      if ((e as { name?: string })?.name !== "RenderingCancelledException") {
        console.error("[PdfViewer] render error:", e);
      }
    }
  }, [page, zoom]);

  useEffect(() => {
    if (!loading && pdfRef.current) {
      renderPage();
    }
  }, [loading, renderPage]);

  // Cursor style per tool
  const cursorMap: Record<string, string> = {
    "add-text": "text",
    "edit-text": "text",
    draw: "crosshair",
    highlight: "cell",
    eraser: "cell",
    sign: "crosshair",
    pointer: "default",
    annotate: "crosshair",
    shapes: "crosshair",
    find: "text",
  };
  const cursor = activeTool ? (cursorMap[activeTool] ?? "default") : "default";

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-destructive/30 bg-destructive/5 p-12 text-center">
        <p className="text-sm font-medium text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative" style={{ cursor }}>
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-muted/80">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Loading PDF...</p>
          </div>
        </div>
      )}

      {/* PDF rendered here */}
      <canvas
        ref={canvasRef}
        className="block rounded-xl shadow-xl shadow-black/10"
      />

      {/* Drawing overlay (tools draw on top of PDF) */}
      <div
        ref={overlayRef}
        className="absolute inset-0 rounded-xl"
        style={{ cursor }}
      />

      {/* Page counter */}
      <div className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2.5 py-1 text-xs text-white">
        {page} / {totalPages}
      </div>
    </div>
  );
}
