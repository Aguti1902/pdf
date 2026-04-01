"use client";

import { useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Download, ZoomIn, ZoomOut, ChevronLeft, ChevronRight,
  Undo2, Redo2, Save, FileText, Type, PenLine, Pencil,
  Highlighter, MessageSquare, Image as ImageIcon, ClipboardList,
  Trash2, ArrowLeft, RotateCw, Eraser, MousePointer2,
  Shapes, StickyNote, Shield, Minimize2, AlignLeft,
  Columns2, Scissors, ArrowUpDown, Upload, FileSearch,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePdfEditor } from "@/hooks/usePdfEditor";
import type { ToolAction } from "@/types";
import type { Annotation, PdfViewerProps, TextBox } from "./PdfViewer";
import { hitTest } from "./PdfViewer";
import { PaywallModal } from "@/components/checkout/PaywallModal";
import { SignatureModal } from "./SignatureModal";
import Link from "next/link";

const PdfViewer = dynamic<PdfViewerProps>(() => import("./PdfViewer"), { ssr: false });

// ─── Tool definitions ─────────────────────────────────────────────────────────

const TOOL_GROUPS: { group: string; items: { action: ToolAction; icon: React.ElementType; label: string }[] }[] = [
  {
    group: "Edit",
    items: [
      { action: "add-text",  icon: Type,         label: "Add Text" },
      { action: "edit-text", icon: AlignLeft,     label: "Edit Text" },
      { action: "draw",      icon: Pencil,        label: "Draw" },
      { action: "highlight", icon: Highlighter,   label: "Highlight" },
      { action: "eraser",    icon: Eraser,        label: "Eraser" },
    ],
  },
  {
    group: "Insert",
    items: [
      { action: "sign",      icon: PenLine,       label: "Sign" },
      { action: "add-image", icon: ImageIcon,     label: "Add Image" },
      { action: "annotate",  icon: MessageSquare, label: "Annotate" },
      { action: "shapes",    icon: Shapes,        label: "Shapes" },
      { action: "notes",     icon: StickyNote,    label: "Notes" },
    ],
  },
  {
    group: "Forms",
    items: [
      { action: "fill-form", icon: ClipboardList, label: "Fill Form" },
      { action: "pointer",   icon: MousePointer2, label: "Select / Move" },
    ],
  },
  {
    group: "Pages",
    items: [
      { action: "rotate",      icon: RotateCw,    label: "Rotate Page" },
      { action: "delete-page", icon: Trash2,      label: "Delete Page" },
      { action: "reorder",     icon: ArrowUpDown, label: "Reorder Pages" },
      { action: "split",       icon: Scissors,    label: "Split PDF" },
      { action: "merge",       icon: Columns2,    label: "Merge PDF" },
    ],
  },
  {
    group: "Tools",
    items: [
      { action: "compress", icon: Minimize2,   label: "Compress" },
      { action: "protect",  icon: Shield,      label: "Protect" },
      { action: "find",     icon: FileSearch,  label: "Find Text" },
    ],
  },
];

const ALL_TOOLS = TOOL_GROUPS.flatMap((g) => g.items);

const CURSORS: Partial<Record<ToolAction, string>> = {
  "add-text": "text", "edit-text": "text", "fill-form": "text",
  sign: "crosshair", draw: "crosshair", highlight: "crosshair",
  shapes: "crosshair", "add-image": "copy",
  eraser: "cell", annotate: "text", notes: "text", find: "text",
  pointer: "default",
};

// ─── EditorLayout ─────────────────────────────────────────────────────────────

export function EditorLayout() {
  const { editorState, setActiveTool, setZoom, setTotalPages, goToPrevPage, goToNextPage } = usePdfEditor();

  // File state
  const [pdfFile,    setPdfFile]    = useState<File | null>(null);
  const [pdfUrl,     setPdfUrl]     = useState<string | null>(null);
  const [fileName,   setFileName]   = useState("No file open");
  const [isDragging, setIsDragging] = useState(false);
  const [rotation,   setRotation]   = useState(0);
  const [deletedPages, setDeletedPages] = useState<Set<number>>(new Set());

  // Annotation state
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [history,     setHistory]     = useState<Annotation[][]>([[]]);
  const [historyIdx,  setHistoryIdx]  = useState(0);

  // Live preview
  const [liveStroke, setLiveStroke] = useState<{ points: { x: number; y: number }[]; color: string; size: number } | null>(null);
  const [liveRect,   setLiveRect]   = useState<{ x: number; y: number; w: number; h: number; color: string; type: "highlight" | "shape"; size: number } | null>(null);

  // Text boxes (HTML overlays inside PDF canvas)
  const [textBoxes, setTextBoxes] = useState<TextBox[]>([]);

  // Selection
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Tool options
  const [toolColor, setToolColor] = useState("#EF4444");
  const [toolSize,  setToolSize]  = useState(3);

  // Modals
  const [showPaywall,   setShowPaywall]   = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);

  // Refs — no stale closures
  const isMouseDown      = useRef(false);
  const dragStart        = useRef<{ x: number; y: number } | null>(null);
  const isPointerDragging = useRef(false);
  const dragAnnStart     = useRef<Annotation | null>(null);

  // File inputs
  const fileInputRef    = useRef<HTMLInputElement>(null);
  const imageInputRef   = useRef<HTMLInputElement>(null);
  const pendingImagePos = useRef<{ x: number; y: number } | null>(null);

  const isPremium = false;
  const activeToolLabel = ALL_TOOLS.find((t) => t.action === editorState.activeTool)?.label;

  // ── History ──────────────────────────────────────────────────────────────────
  const commit = useCallback((next: Annotation[], selectId?: string) => {
    setAnnotations(next);
    setHistory((h) => [...h.slice(0, historyIdx + 1), next]);
    setHistoryIdx((i) => i + 1);
    if (selectId !== undefined) {
      setSelectedId(selectId);
      setActiveTool("pointer");
    }
  }, [historyIdx, setActiveTool]);

  const undo = useCallback(() => {
    setHistoryIdx((i) => {
      const next = Math.max(0, i - 1);
      setHistory((h) => { setAnnotations(h[next] ?? []); return h; });
      return next;
    });
  }, []);

  const redo = useCallback(() => {
    setHistoryIdx((i) => {
      const next = Math.min(history.length - 1, i + 1);
      setHistory((h) => { setAnnotations(h[next] ?? []); return h; });
      return next;
    });
  }, [history.length]);

  // ── File handling ─────────────────────────────────────────────────────────────
  const loadFile = useCallback((file: File) => {
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    const url = URL.createObjectURL(file);
    setPdfFile(file); setPdfUrl(url); setFileName(file.name);
    setAnnotations([]); setHistory([[]]); setHistoryIdx(0);
    setTextBoxes([]); setSelectedId(null); setRotation(0);
    setDeletedPages(new Set());
  }, [pdfUrl]);

  // ── Mouse handlers ────────────────────────────────────────────────────────────
  const handleMouseDown = useCallback((x: number, y: number) => {
    const tool = editorState.activeTool;
    if (!tool) return;
    isMouseDown.current = true;

    // Pointer: select + drag
    if (tool === "pointer") {
      const hit = [...annotations].reverse().find(a => hitTest(a, x, y));
      if (hit) {
        setSelectedId(hit.id);
        isPointerDragging.current = true;
        dragStart.current = { x, y };
        dragAnnStart.current = JSON.parse(JSON.stringify(hit));
      } else {
        setSelectedId(null);
        isPointerDragging.current = false;
      }
      return;
    }

    if (tool === "draw") setLiveStroke({ points: [{ x, y }], color: toolColor, size: toolSize });
    if (tool === "highlight" || tool === "shapes") {
      dragStart.current = { x, y };
      setLiveRect({ x, y, w: 0, h: 0, color: toolColor, type: tool === "highlight" ? "highlight" : "shape", size: toolSize });
    }
    if (["add-text", "edit-text", "annotate", "notes", "fill-form"].includes(tool)) {
      const id = crypto.randomUUID();
      const placeholder = tool === "fill-form" ? "Fill in here..." : tool === "annotate" ? "Add comment..." : "Type here...";
      setTextBoxes((prev) => [...prev, { id, x, y, value: "", color: toolColor, placeholder }]);
      // Auto-switch to pointer after placing
      setActiveTool("pointer");
    }
    if (tool === "add-image") {
      pendingImagePos.current = { x, y };
      imageInputRef.current?.click();
    }
    if (tool === "sign") {
      // Opening sign modal is handled by toolbar click, not canvas click
    }
  }, [editorState.activeTool, toolColor, toolSize, annotations, setActiveTool]);

  const handleMouseMove = useCallback((x: number, y: number) => {
    if (!isMouseDown.current) return;
    const tool = editorState.activeTool;

    // Pointer drag
    if (tool === "pointer" && isPointerDragging.current && dragStart.current && dragAnnStart.current && selectedId) {
      const dx = x - dragStart.current.x, dy = y - dragStart.current.y;
      const orig = dragAnnStart.current;
      setAnnotations(prev => prev.map(ann => {
        if (ann.id !== selectedId) return ann;
        if (ann.type === "draw") {
          const o = orig as typeof ann;
          return { ...ann, points: o.points.map(p => ({ x: p.x + dx, y: p.y + dy })) };
        }
        const o = orig as Extract<Annotation, { x: number }>;
        return { ...ann, x: o.x + dx, y: o.y + dy } as Annotation;
      }));
      return;
    }
    if (tool === "draw") setLiveStroke(p => p ? { ...p, points: [...p.points, { x, y }] } : null);
    if ((tool === "highlight" || tool === "shapes") && dragStart.current) {
      const { x: sx, y: sy } = dragStart.current;
      setLiveRect(p => p ? { ...p, x: Math.min(sx, x), y: Math.min(sy, y), w: Math.abs(x - sx), h: Math.abs(y - sy) } : null);
    }
    if (tool === "eraser") {
      const r = toolSize * 15;
      setAnnotations(prev => {
        const f = prev.filter(a => {
          if (a.type !== "draw") return true;
          return !a.points.some(p => Math.hypot(p.x - x, p.y - y) < r);
        });
        return f.length !== prev.length ? f : prev;
      });
    }
  }, [editorState.activeTool, toolSize, selectedId]);

  const handleMouseUp = useCallback(() => {
    if (!isMouseDown.current) return;
    isMouseDown.current = false;
    const tool = editorState.activeTool;

    if (tool === "pointer" && isPointerDragging.current) {
      isPointerDragging.current = false;
      dragStart.current = null; dragAnnStart.current = null;
      commit(annotations);
      return;
    }
    const newId = crypto.randomUUID();
    if (tool === "draw" && liveStroke && liveStroke.points.length >= 2)
      commit([...annotations, { id: newId, type: "draw", points: liveStroke.points, color: liveStroke.color, size: liveStroke.size }], newId);
    if ((tool === "highlight" || tool === "shapes") && liveRect && liveRect.w > 4 && liveRect.h > 4)
      commit([...annotations, { id: newId, type: liveRect.type, x: liveRect.x, y: liveRect.y, w: liveRect.w, h: liveRect.h, color: liveRect.color, size: liveRect.size }], newId);
    if (tool === "eraser") commit(annotations);

    setLiveStroke(null); setLiveRect(null); dragStart.current = null;
  }, [editorState.activeTool, liveStroke, liveRect, annotations, commit]);

  // ── Image insert ──────────────────────────────────────────────────────────────
  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pendingImagePos.current) return;
    const pos = pendingImagePos.current; pendingImagePos.current = null;
    const reader = new FileReader();
    reader.onload = ev => {
      const src = ev.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const w = Math.min(img.width, 250), h = (img.height / img.width) * w;
        const newId = crypto.randomUUID();
        commit([...annotations, { id: newId, type: "image", x: pos.x, y: pos.y, w, h, src }], newId);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // ── Signature ─────────────────────────────────────────────────────────────────
  const handleSignaturePlaced = useCallback((dataUrl: string) => {
    setShowSignModal(false);
    const img = new Image();
    img.onload = () => {
      const w = Math.min(img.width, 200), h = (img.height / img.width) * w;
      const newId = crypto.randomUUID();
      // Place in center of visible area
      commit([...annotations, { id: newId, type: "image", x: 80, y: 80, w, h, src: dataUrl }], newId);
    };
    img.src = dataUrl;
  }, [annotations, commit]);

  // ── Page operations ───────────────────────────────────────────────────────────
  const rotatePage = () => setRotation(r => (r + 90) % 360);
  const deletePage = () => {
    const p = editorState.currentPage;
    setDeletedPages(prev => new Set([...prev, p]));
    goToNextPage();
  };

  // ── Text box callbacks ────────────────────────────────────────────────────────
  const handleTextBoxBlur = useCallback((id: string, value: string) => {
    setTextBoxes(prev => prev.map(tb => tb.id === id ? { ...tb, value } : tb));
  }, []);
  const handleTextBoxDelete = useCallback((id: string) => {
    setTextBoxes(prev => prev.filter(tb => tb.id !== id));
  }, []);

  const cursor = editorState.activeTool === "pointer" && selectedId ? "move"
    : editorState.activeTool ? (CURSORS[editorState.activeTool] ?? "default") : "default";

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">

      {/* ── Header ── */}
      <header className="flex h-13 shrink-0 items-center gap-3 border-b bg-card px-4 shadow-sm">
        <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
          <FileText className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="hidden font-bold text-sm sm:block">DocForge</span>
        <Separator orientation="vertical" className="h-5" />
        <span className="max-w-[180px] truncate text-sm text-muted-foreground sm:max-w-xs">{fileName}</span>
        {pdfFile && <Badge variant="secondary" className="hidden text-xs sm:flex">{(pdfFile.size / 1024 / 1024).toFixed(1)} MB</Badge>}
        <div className="flex-1" />
        {activeToolLabel && <Badge className="hidden text-xs md:flex">{activeToolLabel}</Badge>}
        <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={() => fileInputRef.current?.click()}>
          <Upload className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Open PDF</span>
        </Button>
        <Button variant="outline" size="sm" className="h-8 gap-1.5">
          <Save className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Save</span>
        </Button>
        <Button size="sm" className="h-8 gap-1.5 font-semibold" onClick={() => !isPremium && setShowPaywall(true)}>
          <Download className="h-3.5 w-3.5" /> Download
        </Button>
        <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) loadFile(f); e.target.value = ""; }} />
        <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left sidebar ── */}
        <aside className="flex w-14 shrink-0 flex-col items-center gap-0.5 overflow-y-auto border-r bg-card py-2 shadow-sm">
          {TOOL_GROUPS.map((group, gi) => (
            <div key={group.group} className="flex w-full flex-col items-center gap-0.5">
              {gi > 0 && <Separator className="my-1.5 w-8" />}
              <p className="mb-0.5 text-[8px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                {group.group}
              </p>
              {group.items.map((item) => (
                <Tooltip key={item.action}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        if (item.action === "sign") { setShowSignModal(true); return; }
                        if (item.action === "rotate") { rotatePage(); return; }
                        if (item.action === "delete-page") { deletePage(); return; }
                        setActiveTool(editorState.activeTool === item.action ? null : item.action);
                      }}
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-lg transition-all",
                        editorState.activeTool === item.action
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="text-xs">{item.label}</TooltipContent>
                </Tooltip>
              ))}
            </div>
          ))}
        </aside>

        {/* ── Canvas area ── */}
        <div className="flex flex-1 flex-col overflow-hidden">

          {/* Top toolbar */}
          <div className="flex h-10 shrink-0 items-center gap-1 border-b bg-card px-3 shadow-sm">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={goToPrevPage} disabled={!pdfUrl}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="min-w-[70px] text-center text-xs text-muted-foreground">
              {editorState.currentPage} / {editorState.totalPages}
            </span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={goToNextPage} disabled={!pdfUrl}>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
            <Separator orientation="vertical" className="h-5" />
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(Math.max(25, editorState.zoom - 10))}>
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <span className="min-w-[40px] text-center text-xs">{editorState.zoom}%</span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(Math.min(200, editorState.zoom + 10))}>
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
            <Separator orientation="vertical" className="h-5" />
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={undo} disabled={historyIdx === 0} title="Undo">
              <Undo2 className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={redo} disabled={historyIdx >= history.length - 1} title="Redo">
              <Redo2 className="h-3.5 w-3.5" />
            </Button>
            {rotation > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">{rotation}°</Badge>
            )}
            {deletedPages.size > 0 && (
              <Badge variant="secondary" className="text-xs">{deletedPages.size} page{deletedPages.size > 1 ? "s" : ""} deleted</Badge>
            )}
            <div className="flex-1" />
            <span className="text-xs text-muted-foreground">{annotations.length + textBoxes.length} element{annotations.length + textBoxes.length !== 1 ? "s" : ""}</span>
          </div>

          {/* PDF canvas */}
          <div
            className="relative flex-1 overflow-auto bg-muted/30"
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={e => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) loadFile(f); }}
          >
            {isDragging && (
              <div className="absolute inset-0 z-30 flex items-center justify-center border-4 border-dashed border-primary bg-primary/5">
                <p className="text-lg font-bold text-primary">Drop PDF here</p>
              </div>
            )}

            {deletedPages.has(editorState.currentPage) ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Trash2 className="mx-auto mb-2 h-10 w-10 opacity-30" />
                  <p className="text-sm font-medium">Page {editorState.currentPage} deleted</p>
                  <Button variant="link" size="sm" onClick={() => setDeletedPages(p => { const n = new Set(p); n.delete(editorState.currentPage); return n; })}>
                    Restore page
                  </Button>
                </div>
              </div>
            ) : pdfUrl ? (
              <div className="flex min-h-full items-start justify-center p-6">
                <PdfViewer
                  url={pdfUrl}
                  page={editorState.currentPage}
                  zoom={editorState.zoom}
                  rotation={rotation}
                  annotations={annotations}
                  textBoxes={textBoxes}
                  selectedId={selectedId}
                  cursor={cursor}
                  liveStroke={liveStroke}
                  liveRect={liveRect}
                  onPdfLoaded={setTotalPages}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onTextBoxBlur={handleTextBoxBlur}
                  onTextBoxDelete={handleTextBoxDelete}
                />
              </div>
            ) : (
              <div className="flex h-full items-center justify-center p-6">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full max-w-md cursor-pointer flex-col items-center gap-5 rounded-2xl border-2 border-dashed border-border bg-card p-14 text-center transition-all hover:border-primary/50 hover:bg-primary/5 focus:outline-none"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-base font-semibold">Open a PDF to start editing</p>
                    <p className="mt-1 text-sm text-muted-foreground">Click here or drag & drop your PDF</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">PDF up to 100MB</Badge>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Right panel ── */}
        <aside className="hidden w-56 shrink-0 flex-col overflow-y-auto border-l bg-card p-4 lg:flex">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {activeToolLabel ? `${activeToolLabel} Options` : "Properties"}
          </h3>

          {editorState.activeTool ? (
            <ToolOptions
              tool={editorState.activeTool}
              color={toolColor} size={toolSize}
              selectedId={selectedId}
              onColorChange={setToolColor}
              onSizeChange={setToolSize}
              onDeleteSelected={() => {
                if (!selectedId) return;
                commit(annotations.filter(a => a.id !== selectedId));
                setSelectedId(null);
              }}
              onOpenSignModal={() => setShowSignModal(true)}
            />
          ) : (
            <p className="text-xs text-muted-foreground">Select a tool from the sidebar.</p>
          )}

          <div className="mt-auto pt-4">
            <Separator className="mb-3" />
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex justify-between"><span>Page</span><span>{editorState.currentPage} / {editorState.totalPages}</span></div>
              <div className="flex justify-between"><span>Zoom</span><span>{editorState.zoom}%</span></div>
              <div className="flex justify-between"><span>Rotation</span><span>{rotation}°</span></div>
              <div className="flex justify-between"><span>Elements</span><span>{annotations.length + textBoxes.length}</span></div>
              {pdfFile && <div className="flex justify-between"><span>Size</span><span>{(pdfFile.size / 1024 / 1024).toFixed(1)} MB</span></div>}
            </div>
          </div>
        </aside>
      </div>

      {/* ── Modals ── */}
      <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} toolName="Edit PDF" />
      {showSignModal && (
        <SignatureModal onConfirm={handleSignaturePlaced} onClose={() => setShowSignModal(false)} />
      )}
    </div>
  );
}

// ─── Tool Options Panel ───────────────────────────────────────────────────────

function ToolOptions({ tool, color, size, selectedId, onColorChange, onSizeChange, onDeleteSelected, onOpenSignModal }: {
  tool: ToolAction; color: string; size: number; selectedId?: string | null;
  onColorChange: (c: string) => void; onSizeChange: (s: number) => void;
  onDeleteSelected?: () => void; onOpenSignModal?: () => void;
}) {
  const DRAW_COLORS = ["#000000", "#EF4444", "#3B82F6", "#22C55E", "#F59E0B", "#8B5CF6", "#EC4899", "#FFFFFF"];
  const HL_COLORS   = ["#FDE047", "#86EFAC", "#93C5FD", "#F9A8D4", "#FCA5A5", "#C4B5FD"];
  const SIZES       = [1, 2, 4, 6, 10, 16];

  const isDrawable  = ["draw", "shapes", "annotate"].includes(tool);
  const isHighlight = tool === "highlight";
  const isText      = ["add-text", "edit-text", "notes", "fill-form"].includes(tool);

  return (
    <div className="space-y-4 text-xs">

      {/* Color */}
      {(isDrawable || isHighlight || isText) && (
        <div className="space-y-2">
          <p className="font-semibold uppercase tracking-wider text-muted-foreground">Color</p>
          <div className="flex flex-wrap gap-1.5">
            {(isHighlight ? HL_COLORS : DRAW_COLORS).map(c => (
              <button key={c} onClick={() => onColorChange(c)}
                className={cn("h-6 w-6 rounded-full border-2 transition-all hover:scale-110",
                  color === c ? "scale-125 border-foreground" : "border-transparent shadow-sm")}
                style={{ backgroundColor: c }} />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input type="color" value={color} onChange={e => onColorChange(e.target.value)}
              className="h-7 w-7 cursor-pointer rounded border" />
            <span className="font-mono text-muted-foreground">{color}</span>
          </div>
        </div>
      )}

      {/* Size */}
      {(isDrawable || tool === "eraser") && (
        <div className="space-y-2">
          <p className="font-semibold uppercase tracking-wider text-muted-foreground">Size — {size}px</p>
          <input type="range" min={1} max={20} value={size}
            onChange={e => onSizeChange(Number(e.target.value))} className="w-full accent-primary" />
          <div className="flex gap-1">
            {SIZES.map(s => (
              <button key={s} onClick={() => onSizeChange(s)}
                className={cn("flex h-6 w-6 items-center justify-center rounded border transition-colors",
                  size === s ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:bg-muted")}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Text tool hints */}
      {isText && (
        <div className="rounded-lg border bg-muted/40 p-2.5 text-muted-foreground">
          Click on the PDF where you want to add text. Press <kbd className="rounded bg-muted px-1">Esc</kbd> to confirm.
        </div>
      )}

      {/* Sign */}
      {tool === "sign" && (
        <div className="space-y-2">
          <p className="text-muted-foreground">Click the button below to create your signature, then it will be placed on the document.</p>
          <button onClick={onOpenSignModal}
            className="w-full rounded-lg border-2 border-primary bg-primary/5 py-2 text-primary font-medium hover:bg-primary/10 transition-colors">
            ✏️ Create signature
          </button>
        </div>
      )}

      {/* Add image */}
      {tool === "add-image" && (
        <div className="rounded-lg border bg-muted/40 p-2.5 text-muted-foreground">
          Click on the PDF to place an image. A file picker will open.
        </div>
      )}

      {/* Pointer */}
      {tool === "pointer" && (
        <div className="space-y-2">
          {selectedId ? (
            <>
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-2.5 text-primary">
                ✓ Selected — drag to move
              </div>
              <button onClick={onDeleteSelected}
                className="flex w-full items-center justify-center gap-1.5 rounded border border-destructive/40 bg-destructive/5 py-1.5 font-medium text-destructive hover:bg-destructive/10 transition-colors">
                🗑 Delete selected
              </button>
            </>
          ) : (
            <div className="rounded-lg border bg-muted/40 p-2.5 text-muted-foreground">
              Click any element to select it, then drag to move it.
            </div>
          )}
        </div>
      )}

      {/* Page tools */}
      {tool === "rotate" && (
        <div className="space-y-2">
          <p className="text-muted-foreground">Click the Rotate button in the sidebar to rotate the current page 90° clockwise.</p>
          <div className="rounded-lg border bg-blue-50 p-2.5 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
            Current rotation: <strong>{/* rotation shown in toolbar */}</strong> Use the sidebar button repeatedly to rotate further.
          </div>
        </div>
      )}
      {tool === "delete-page" && (
        <div className="rounded-lg border bg-red-50 p-2.5 text-red-800 dark:bg-red-900/20 dark:text-red-300">
          Click the Delete Page button to remove the current page from the editor. You can restore it from the toolbar.
        </div>
      )}
      {tool === "reorder" && (
        <div className="rounded-lg border bg-muted/40 p-2.5 text-muted-foreground">
          Use the navigation arrows in the toolbar to navigate pages. Reorder via drag-and-drop will be available in the next update.
        </div>
      )}
      {tool === "split" && (
        <div className="space-y-2">
          <p className="font-semibold text-muted-foreground">Split at page:</p>
          <input type="number" min={1} defaultValue={1} placeholder="Page number"
            className="w-full rounded border bg-background px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary" />
          <button className="w-full rounded bg-primary px-2 py-1.5 font-medium text-primary-foreground hover:bg-primary/90">
            Apply split on download
          </button>
        </div>
      )}
      {tool === "merge" && (
        <div className="space-y-2">
          <p className="text-muted-foreground">Add a second PDF to merge with the current one.</p>
          <label className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded border-2 border-dashed border-border py-2 hover:border-primary hover:bg-primary/5 transition-colors">
            <Upload className="h-3.5 w-3.5" />
            <span>Select PDF to merge</span>
            <input type="file" accept=".pdf" className="hidden" />
          </label>
        </div>
      )}
      {tool === "compress" && (
        <div className="space-y-2">
          <p className="font-semibold text-muted-foreground">Quality:</p>
          {["Low (max compression)", "Medium (balanced)", "High (best quality)"].map((q, i) => (
            <label key={q} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="quality" defaultChecked={i === 1} className="accent-primary" />
              <span className="text-muted-foreground">{q}</span>
            </label>
          ))}
        </div>
      )}
      {tool === "protect" && (
        <div className="space-y-2">
          <p className="font-semibold text-muted-foreground">Password:</p>
          <input type="password" placeholder="Set password..." className="w-full rounded border bg-background px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary" />
          <input type="password" placeholder="Confirm password..." className="w-full rounded border bg-background px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary" />
          <button className="w-full rounded bg-primary px-2 py-1.5 font-medium text-primary-foreground hover:bg-primary/90">
            Apply on download
          </button>
        </div>
      )}
      {tool === "find" && (
        <div className="space-y-2">
          <input type="text" placeholder="Search text in PDF..."
            className="w-full rounded border bg-background px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary" />
          <button className="w-full rounded bg-primary px-2 py-1.5 font-medium text-primary-foreground hover:bg-primary/90">
            Find
          </button>
          <p className="text-muted-foreground">Highlights will appear on the document.</p>
        </div>
      )}
    </div>
  );
}
