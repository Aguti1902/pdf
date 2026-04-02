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
  Highlighter, Image as ImageIcon, Trash2, ArrowLeft,
  RotateCw, Eraser, MousePointer2, Shapes, Upload, Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePdfEditor } from "@/hooks/usePdfEditor";
import type { ToolAction } from "@/types";
import type { Annotation, PdfViewerProps, TextBox } from "./PdfViewer";
import { hitTest } from "./PdfViewer";
import { PaywallModal } from "@/components/checkout/PaywallModal";
import { SignatureModal } from "./SignatureModal";
import { AuthModal } from "@/components/auth/AuthModal";
import Link from "next/link";

const PdfViewer = dynamic<PdfViewerProps>(() => import("./PdfViewer"), { ssr: false });

// ─── Tool definitions (only functional ones) ─────────────────────────────────

const TOOL_GROUPS: {
  group: string;
  items: { action: ToolAction; icon: React.ElementType; label: string; desc: string }[];
}[] = [
  {
    group: "Edit",
    items: [
      { action: "pointer",   icon: MousePointer2, label: "Select / Move", desc: "Select and move elements" },
      { action: "add-text",  icon: Type,          label: "Add Text",      desc: "Click to add a text box" },
      { action: "draw",      icon: Pencil,        label: "Draw",          desc: "Freehand drawing" },
      { action: "highlight", icon: Highlighter,   label: "Highlight",     desc: "Highlight areas" },
      { action: "shapes",    icon: Shapes,        label: "Rectangle",     desc: "Draw a rectangle" },
      { action: "eraser",    icon: Eraser,        label: "Eraser",        desc: "Erase drawings" },
    ],
  },
  {
    group: "Insert",
    items: [
      { action: "sign",      icon: PenLine,    label: "Sign",       desc: "Create and place a signature" },
      { action: "add-image", icon: ImageIcon,  label: "Add Image",  desc: "Click to insert an image" },
    ],
  },
  {
    group: "Pages",
    items: [
      { action: "rotate",      icon: RotateCw, label: "Rotate Page",  desc: "Rotate this page 90°" },
      { action: "delete-page", icon: Trash2,   label: "Delete Page",  desc: "Remove this page" },
    ],
  },
];

const ALL_TOOLS = TOOL_GROUPS.flatMap(g => g.items);

const CURSORS: Partial<Record<ToolAction, string>> = {
  "add-text": "text", sign: "crosshair", draw: "crosshair",
  highlight: "crosshair", shapes: "crosshair", "add-image": "copy",
  eraser: "cell", pointer: "default",
};

// ─── EditorLayout ─────────────────────────────────────────────────────────────

export function EditorLayout() {
  const { editorState, setActiveTool, setZoom, setTotalPages, goToPrevPage, goToNextPage } = usePdfEditor();

  // File
  const [pdfFile,      setPdfFile]      = useState<File | null>(null);
  const [pdfUrl,       setPdfUrl]       = useState<string | null>(null);
  const [fileName,     setFileName]     = useState("No file open");
  const [isDragging,   setIsDragging]   = useState(false);
  const [pageRotation, setPageRotation] = useState(0);
  const [deletedPages, setDeletedPages] = useState<Set<number>>(new Set());

  // Annotations
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [history,     setHistory]     = useState<Annotation[][]>([[]]);
  const [historyIdx,  setHistoryIdx]  = useState(0);
  const [liveStroke,  setLiveStroke]  = useState<{ points: {x:number;y:number}[]; color:string; size:number } | null>(null);
  const [liveRect,    setLiveRect]    = useState<{ x:number;y:number;w:number;h:number;color:string;type:"highlight"|"shape";size:number } | null>(null);
  const [textBoxes,   setTextBoxes]   = useState<TextBox[]>([]);
  const [selectedId,  setSelectedId]  = useState<string | null>(null);

  // Tool options
  const [toolColor, setToolColor] = useState("#EF4444");
  const [toolSize,  setToolSize]  = useState(3);

  // Modals — auth → paywall in sequence
  const [showAuth,      setShowAuth]      = useState(false);
  const [showPaywall,   setShowPaywall]   = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);
  const [userEmail,     setUserEmail]     = useState("");
  const [userName,      setUserName]      = useState("");

  // Refs
  const isMouseDown        = useRef(false);
  const dragStart          = useRef<{x:number;y:number} | null>(null);
  const isPointerDragging  = useRef(false);
  const dragAnnStart       = useRef<Annotation | null>(null);
  const isRotatingRef      = useRef(false);
  const rotationCenter     = useRef<{x:number;y:number}>({ x: 0, y: 0 });
  const rotationStartAngle = useRef(0);
  const rotationStartEl    = useRef(0);

  const fileInputRef    = useRef<HTMLInputElement>(null);
  const imageInputRef   = useRef<HTMLInputElement>(null);
  const pendingImagePos = useRef<{x:number;y:number} | null>(null);

  const isPremium = false;

  // ── History ──────────────────────────────────────────────────────────────────
  const commit = useCallback((next: Annotation[], selectId?: string) => {
    setAnnotations(next);
    setHistory(h => [...h.slice(0, historyIdx + 1), next]);
    setHistoryIdx(i => i + 1);
    if (selectId !== undefined) { setSelectedId(selectId); setActiveTool("pointer"); }
  }, [historyIdx, setActiveTool]);

  const undo = () => {
    if (historyIdx === 0) return;
    const next = historyIdx - 1;
    setAnnotations(history[next] ?? []);
    setHistoryIdx(next);
  };
  const redo = () => {
    if (historyIdx >= history.length - 1) return;
    const next = historyIdx + 1;
    setAnnotations(history[next] ?? []);
    setHistoryIdx(next);
  };

  // ── File ─────────────────────────────────────────────────────────────────────
  const loadFile = useCallback((file: File) => {
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    const url = URL.createObjectURL(file);
    setPdfFile(file); setPdfUrl(url); setFileName(file.name);
    setAnnotations([]); setHistory([[]]); setHistoryIdx(0);
    setTextBoxes([]); setSelectedId(null); setPageRotation(0);
    setDeletedPages(new Set());
  }, [pdfUrl]);

  // ── Mouse ─────────────────────────────────────────────────────────────────────
  const handleMouseDown = useCallback((x: number, y: number) => {
    const tool = editorState.activeTool;
    if (!tool) return;
    isMouseDown.current = true;

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
    if (tool === "add-text") {
      const id = crypto.randomUUID();
      setTextBoxes(prev => [...prev, { id, x, y, value: "", color: toolColor, placeholder: "Type here..." }]);
      setActiveTool("pointer");
    }
    if (tool === "add-image") { pendingImagePos.current = { x, y }; imageInputRef.current?.click(); }
  }, [editorState.activeTool, toolColor, toolSize, annotations, setActiveTool]);

  const handleMouseMove = useCallback((x: number, y: number) => {
    if (!isMouseDown.current && !isRotatingRef.current) return;
    const tool = editorState.activeTool;

    // Rotation
    if (isRotatingRef.current && selectedId) {
      const { x: cx, y: cy } = rotationCenter.current;
      const angle = Math.atan2(y - cy, x - cx) * (180 / Math.PI);
      const delta = angle - rotationStartAngle.current;
      const newRot = rotationStartEl.current + delta;
      setAnnotations(prev => prev.map(a => a.id === selectedId ? { ...a, rotation: newRot } : a));
      return;
    }

    // Pointer drag
    if (tool === "pointer" && isPointerDragging.current && dragStart.current && dragAnnStart.current && selectedId) {
      const dx = x - dragStart.current.x, dy = y - dragStart.current.y;
      const orig = dragAnnStart.current;
      setAnnotations(prev => prev.map(ann => {
        if (ann.id !== selectedId) return ann;
        if (ann.type === "draw") {
          const o = orig as DrawAnnotation;
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
      setLiveRect(p => p ? { ...p, x: Math.min(sx,x), y: Math.min(sy,y), w: Math.abs(x-sx), h: Math.abs(y-sy) } : null);
    }
    if (tool === "eraser") {
      const r = toolSize * 15;
      setAnnotations(prev => prev.filter(a => a.type !== "draw" || !a.points.some(p => Math.hypot(p.x-x, p.y-y) < r)));
    }
  }, [editorState.activeTool, toolSize, selectedId]);

  const handleMouseUp = useCallback(() => {
    // Finish rotation
    if (isRotatingRef.current) {
      isRotatingRef.current = false;
      commit(annotations);
      return;
    }
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

  // ── Rotation handle ───────────────────────────────────────────────────────────
  const handleRotateStart = useCallback((id: string, cx: number, cy: number) => {
    const ann = annotations.find(a => a.id === id);
    if (!ann) return;
    isRotatingRef.current = true;
    rotationCenter.current = { x: cx, y: cy };
    rotationStartEl.current = ann.rotation ?? 0;
    // We need the initial mouse angle — we'll compute it on first move, so set 0 for now
    // The actual angle will be captured from the mouse position on next move
    // Store a sentinel to detect the first move
    rotationStartAngle.current = NaN;
    setSelectedId(id);
  }, [annotations]);

  // Override: on first mousemove after rotate start, capture start angle
  const handleMouseMoveWithRotate = useCallback((x: number, y: number) => {
    if (isRotatingRef.current && isNaN(rotationStartAngle.current)) {
      const { x: cx, y: cy } = rotationCenter.current;
      rotationStartAngle.current = Math.atan2(y - cy, x - cx) * (180 / Math.PI);
      return;
    }
    handleMouseMove(x, y);
  }, [handleMouseMove]);

  // ── Image ─────────────────────────────────────────────────────────────────────
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
      commit([...annotations, { id: newId, type: "image", x: 80, y: 80, w, h, src: dataUrl }], newId);
    };
    img.src = dataUrl;
  }, [annotations, commit]);

  // ── Text boxes ────────────────────────────────────────────────────────────────
  const handleTextBoxBlur   = useCallback((id: string, value: string) => setTextBoxes(p => p.map(tb => tb.id === id ? { ...tb, value } : tb)), []);
  const handleTextBoxDelete = useCallback((id: string) => setTextBoxes(p => p.filter(tb => tb.id !== id)), []);

  // ── Page ops ──────────────────────────────────────────────────────────────────
  const rotatePage = () => setPageRotation(r => (r + 90) % 360);
  const deletePage = () => {
    setDeletedPages(p => new Set([...p, editorState.currentPage]));
    goToNextPage();
  };

  // ── Download / Share flow: Auth → Paywall ─────────────────────────────────────
  const startDownload = () => {
    if (!isPremium) setShowAuth(true);
  };
  const onAuthSuccess = (email: string, name: string) => {
    setUserEmail(email);
    setUserName(name);
    setShowAuth(false);
    setShowPaywall(true);
  };

  const cursor = editorState.activeTool === "pointer" && selectedId ? "move"
    : editorState.activeTool ? (CURSORS[editorState.activeTool] ?? "default") : "default";

  const activeItem = ALL_TOOLS.find(t => t.action === editorState.activeTool);

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
        {activeItem && <Badge className="hidden text-xs md:flex">{activeItem.label}</Badge>}
        <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={() => fileInputRef.current?.click()}>
          <Upload className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Open PDF</span>
        </Button>
        <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={startDownload}>
          <Share2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Share</span>
        </Button>
        <Button size="sm" className="h-8 gap-1.5 font-semibold" onClick={startDownload}>
          <Download className="h-3.5 w-3.5" /> Download
        </Button>
        <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) loadFile(f); e.target.value = ""; }} />
        <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar ── */}
        <aside className="flex w-14 shrink-0 flex-col items-center gap-0.5 overflow-y-auto border-r bg-card py-2 shadow-sm">
          {TOOL_GROUPS.map((group, gi) => (
            <div key={group.group} className="flex w-full flex-col items-center gap-0.5">
              {gi > 0 && <Separator className="my-1.5 w-8" />}
              <p className="mb-0.5 text-[8px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                {group.group}
              </p>
              {group.items.map(item => (
                <Tooltip key={item.action}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        if (item.action === "sign")        { setShowSignModal(true); return; }
                        if (item.action === "rotate")      { rotatePage(); return; }
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
                  <TooltipContent side="right" className="text-xs">
                    <p className="font-medium">{item.label}</p>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          ))}
        </aside>

        {/* ── Canvas ── */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="flex h-10 shrink-0 items-center gap-1 border-b bg-card px-3 shadow-sm">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={goToPrevPage} disabled={!pdfUrl}><ChevronLeft className="h-3.5 w-3.5" /></Button>
            <span className="min-w-[70px] text-center text-xs text-muted-foreground">{editorState.currentPage} / {editorState.totalPages}</span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={goToNextPage}  disabled={!pdfUrl}><ChevronRight className="h-3.5 w-3.5" /></Button>
            <Separator orientation="vertical" className="h-5" />
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(Math.max(25, editorState.zoom - 10))}><ZoomOut className="h-3.5 w-3.5" /></Button>
            <span className="min-w-[40px] text-center text-xs">{editorState.zoom}%</span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(Math.min(200, editorState.zoom + 10))}><ZoomIn className="h-3.5 w-3.5" /></Button>
            <Separator orientation="vertical" className="h-5" />
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={undo} disabled={historyIdx === 0}><Undo2 className="h-3.5 w-3.5" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={redo} disabled={historyIdx >= history.length - 1}><Redo2 className="h-3.5 w-3.5" /></Button>
            {pageRotation > 0 && <Badge variant="secondary" className="ml-1 text-xs">{pageRotation}° rotated</Badge>}
            {deletedPages.size > 0 && <Badge variant="secondary" className="text-xs">{deletedPages.size} page{deletedPages.size > 1 ? "s" : ""} deleted</Badge>}
            <div className="flex-1" />
            <Button variant="ghost" size="icon" className="h-7 w-7" title="Save">
              <Save className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Canvas area */}
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
                  pageRotation={pageRotation}
                  annotations={annotations}
                  textBoxes={textBoxes}
                  selectedId={selectedId}
                  cursor={cursor}
                  liveStroke={liveStroke}
                  liveRect={liveRect}
                  onPdfLoaded={setTotalPages}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMoveWithRotate}
                  onMouseUp={handleMouseUp}
                  onTextBoxBlur={handleTextBoxBlur}
                  onTextBoxDelete={handleTextBoxDelete}
                  onRotateStart={handleRotateStart}
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
        <aside className="hidden w-52 shrink-0 flex-col border-l bg-card p-4 lg:flex">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {activeItem ? activeItem.label : "Properties"}
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
            <p className="text-xs text-muted-foreground">Select a tool from the sidebar to get started.</p>
          )}

          <div className="mt-auto pt-4">
            <Separator className="mb-3" />
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex justify-between"><span>Page</span><span>{editorState.currentPage} / {editorState.totalPages}</span></div>
              <div className="flex justify-between"><span>Zoom</span><span>{editorState.zoom}%</span></div>
              <div className="flex justify-between"><span>Elements</span><span>{annotations.length + textBoxes.length}</span></div>
              {pdfFile && <div className="flex justify-between"><span>Size</span><span>{(pdfFile.size / 1024 / 1024).toFixed(1)} MB</span></div>}
            </div>
          </div>
        </aside>
      </div>

      {/* ── Modals ── */}
      <AuthModal    open={showAuth}    onClose={() => setShowAuth(false)}  onSuccess={onAuthSuccess} />
      <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} toolName="Download PDF" userEmail={userEmail} userName={userName} />
      {showSignModal && <SignatureModal onConfirm={handleSignaturePlaced} onClose={() => setShowSignModal(false)} />}
    </div>
  );
}

// ─── Type alias to silence import-only use ────────────────────────────────────
type DrawAnnotation = Extract<Annotation, { type: "draw" }>;

// ─── Tool Options Panel ───────────────────────────────────────────────────────

function ToolOptions({ tool, color, size, selectedId, onColorChange, onSizeChange, onDeleteSelected, onOpenSignModal }: {
  tool: ToolAction; color: string; size: number; selectedId?: string | null;
  onColorChange: (c: string) => void; onSizeChange: (s: number) => void;
  onDeleteSelected?: () => void; onOpenSignModal?: () => void;
}) {
  const COLORS = ["#000000","#EF4444","#3B82F6","#22C55E","#F59E0B","#8B5CF6","#EC4899","#FFFFFF"];
  const HL_COLORS = ["#FDE047","#86EFAC","#93C5FD","#F9A8D4","#FCA5A5","#C4B5FD"];
  const SIZES = [1, 2, 4, 6, 10, 16];

  const isDrawable  = ["draw", "shapes"].includes(tool);
  const isHighlight = tool === "highlight";

  return (
    <div className="space-y-4 text-xs">
      {(isDrawable || isHighlight) && (
        <div className="space-y-2">
          <p className="font-semibold uppercase tracking-wider text-muted-foreground">Color</p>
          <div className="flex flex-wrap gap-1.5">
            {(isHighlight ? HL_COLORS : COLORS).map(c => (
              <button key={c} onClick={() => onColorChange(c)}
                className={cn("h-6 w-6 rounded-full border-2 transition-all hover:scale-110",
                  color === c ? "scale-125 border-foreground" : "border-transparent shadow-sm")}
                style={{ backgroundColor: c }} />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input type="color" value={color} onChange={e => onColorChange(e.target.value)} className="h-7 w-7 cursor-pointer rounded border" />
            <span className="font-mono text-muted-foreground">{color}</span>
          </div>
        </div>
      )}

      {tool === "add-text" && (
        <div className="space-y-2">
          <p className="font-semibold uppercase tracking-wider text-muted-foreground">Text Color</p>
          <div className="flex flex-wrap gap-1.5">
            {COLORS.map(c => (
              <button key={c} onClick={() => onColorChange(c)}
                className={cn("h-6 w-6 rounded-full border-2 transition-all hover:scale-110",
                  color === c ? "scale-125 border-foreground" : "border-transparent shadow-sm")}
                style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>
      )}

      {(isDrawable || tool === "eraser") && (
        <div className="space-y-2">
          <p className="font-semibold uppercase tracking-wider text-muted-foreground">Size — {size}px</p>
          <input type="range" min={1} max={20} value={size} onChange={e => onSizeChange(Number(e.target.value))} className="w-full accent-primary" />
          <div className="flex gap-1">
            {SIZES.map(s => (
              <button key={s} onClick={() => onSizeChange(s)}
                className={cn("flex h-6 w-6 items-center justify-center rounded border text-[10px] transition-colors",
                  size === s ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:bg-muted")}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {tool === "add-text" && (
        <div className="rounded-lg border bg-muted/40 p-2.5 text-muted-foreground leading-relaxed">
          Click on the document where you want to add text. Press <kbd className="rounded bg-muted px-1">Esc</kbd> to confirm.
        </div>
      )}

      {tool === "sign" && (
        <div className="space-y-2">
          <p className="text-muted-foreground">Create your signature and place it anywhere on the document.</p>
          <button onClick={onOpenSignModal}
            className="w-full rounded-lg border-2 border-primary bg-primary/5 py-2 text-xs font-medium text-primary hover:bg-primary/10 transition-colors">
            ✏️ Create signature
          </button>
        </div>
      )}

      {tool === "add-image" && (
        <div className="rounded-lg border bg-muted/40 p-2.5 text-muted-foreground leading-relaxed">
          Click on the document to choose where to place the image. A file picker will open.
        </div>
      )}

      {tool === "pointer" && (
        <div className="space-y-2">
          {selectedId ? (
            <>
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-2.5 text-xs text-primary space-y-1">
                <p className="font-medium">Element selected</p>
                <p className="text-muted-foreground">Drag to move • Grab the blue circle to rotate</p>
              </div>
              <button onClick={onDeleteSelected}
                className="flex w-full items-center justify-center gap-1.5 rounded border border-destructive/40 bg-destructive/5 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors">
                🗑 Delete selected
              </button>
            </>
          ) : (
            <div className="rounded-lg border bg-muted/40 p-2.5 text-xs text-muted-foreground leading-relaxed">
              Click any element to select it. Then drag to move it or grab the blue circle handle to rotate it.
            </div>
          )}
        </div>
      )}

      {tool === "rotate" && (
        <div className="rounded-lg border bg-blue-50 p-2.5 text-xs text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 leading-relaxed">
          Click the Rotate Page button to rotate 90° clockwise. Click again to keep rotating.
        </div>
      )}
      {tool === "delete-page" && (
        <div className="rounded-lg border bg-red-50 p-2.5 text-xs text-red-700 dark:bg-red-900/20 dark:text-red-300 leading-relaxed">
          Deletes the current page from the editor. You can restore it by clicking "Restore page" in the canvas.
        </div>
      )}
      {tool === "eraser" && (
        <div className="rounded-lg border bg-muted/40 p-2.5 text-xs text-muted-foreground leading-relaxed">
          Drag over drawings to erase them. Adjust size for precision.
        </div>
      )}
    </div>
  );
}
