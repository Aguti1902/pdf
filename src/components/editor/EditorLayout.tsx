"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Download,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Undo2,
  Redo2,
  Save,
  FileText,
  Type,
  PenLine,
  Pencil,
  Highlighter,
  MessageSquare,
  Image as ImageIcon,
  ClipboardList,
  Trash2,
  ArrowLeft,
  RotateCw,
  Eraser,
  MousePointer2,
  Shapes,
  StickyNote,
  Shield,
  Minimize2,
  AlignLeft,
  Columns2,
  Scissors,
  ArrowUpDown,
  Upload,
  FileSearch,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePdfEditor } from "@/hooks/usePdfEditor";
import type { ToolAction } from "@/types";
import { PaywallModal } from "@/components/checkout/PaywallModal";
import Link from "next/link";
import dynamic from "next/dynamic";

// Lazy load PdfViewer so pdfjs-dist only loads client-side
const PdfViewer = dynamic(() => import("./PdfViewer"), { ssr: false });

// ─── Tool groups ─────────────────────────────────────────────────────────────

const toolGroups: { group: string; items: { action: ToolAction; icon: React.ElementType; label: string }[] }[] = [
  {
    group: "Edit",
    items: [
      { action: "add-text", icon: Type, label: "Add Text" },
      { action: "edit-text", icon: AlignLeft, label: "Edit Text" },
      { action: "draw", icon: Pencil, label: "Draw" },
      { action: "highlight", icon: Highlighter, label: "Highlight" },
      { action: "eraser", icon: Eraser, label: "Eraser" },
    ],
  },
  {
    group: "Insert",
    items: [
      { action: "sign", icon: PenLine, label: "Sign" },
      { action: "add-image", icon: ImageIcon, label: "Add Image" },
      { action: "annotate", icon: MessageSquare, label: "Annotate" },
      { action: "shapes", icon: Shapes, label: "Shapes" },
      { action: "notes", icon: StickyNote, label: "Notes" },
    ],
  },
  {
    group: "Forms",
    items: [
      { action: "fill-form", icon: ClipboardList, label: "Fill Form" },
      { action: "pointer", icon: MousePointer2, label: "Pointer" },
    ],
  },
  {
    group: "Pages",
    items: [
      { action: "rotate", icon: RotateCw, label: "Rotate Page" },
      { action: "delete-page", icon: Trash2, label: "Delete Page" },
      { action: "reorder", icon: ArrowUpDown, label: "Reorder Pages" },
      { action: "split", icon: Scissors, label: "Split PDF" },
      { action: "merge", icon: Columns2, label: "Merge PDF" },
    ],
  },
  {
    group: "Tools",
    items: [
      { action: "compress", icon: Minimize2, label: "Compress" },
      { action: "protect", icon: Shield, label: "Protect" },
      { action: "find", icon: FileSearch, label: "Find Text" },
    ],
  },
];

const allTools = toolGroups.flatMap((g) => g.items);

// ─── Component ────────────────────────────────────────────────────────────────

export function EditorLayout() {
  const { editorState, setActiveTool, setZoom, goToPrevPage, goToNextPage } = usePdfEditor();
  const [showPaywall, setShowPaywall] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("No file open");
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [toolColor, setToolColor] = useState("#EF4444");
  const [toolSize, setToolSize] = useState(3);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isPremium = false;

  const loadFile = useCallback((file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      return;
    }
    const url = URL.createObjectURL(file);
    setPdfFile(file);
    setPdfUrl(url);
    setFileName(file.name);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleDragLeave = () => setIsDraggingFile(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files[0];
    if (file) loadFile(file);
  };

  const handleDownload = () => {
    if (!isPremium) {
      setShowPaywall(true);
    }
  };

  const activeToolLabel = allTools.find((t) => t.action === editorState.activeTool)?.label;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* ── Editor Header ── */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-card px-4 shadow-sm">
        {/* Left: back + logo + filename */}
        <Link
          href="/"
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
            <FileText className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="hidden font-bold text-sm sm:block">DocForge</span>
        </div>

        <Separator orientation="vertical" className="h-5" />

        <span className="max-w-[160px] truncate text-sm text-muted-foreground sm:max-w-xs">
          {fileName}
        </span>

        {pdfFile && (
          <Badge variant="secondary" className="text-xs hidden sm:flex">
            {(pdfFile.size / 1024 / 1024).toFixed(1)} MB
          </Badge>
        )}

        <div className="flex-1" />

        {/* Center: active tool badge */}
        {activeToolLabel && (
          <Badge className="hidden text-xs md:flex capitalize">
            {activeToolLabel} active
          </Badge>
        )}

        {editorState.isDirty && (
          <Badge variant="secondary" className="text-xs">Unsaved</Badge>
        )}

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Open PDF</span>
          </Button>

          <Button variant="outline" size="sm" className="h-8 gap-1.5">
            <Save className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Save</span>
          </Button>

          <Button size="sm" className="h-8 gap-1.5 font-semibold" onClick={handleDownload}>
            <Download className="h-3.5 w-3.5" />
            Download
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={handleFileInput}
        />
      </header>

      {/* ── Main editor body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Left Sidebar ── */}
        <aside className="flex w-14 shrink-0 flex-col items-center gap-0.5 overflow-y-auto border-r bg-card py-2 shadow-sm">
          {toolGroups.map((group, gi) => (
            <div key={group.group} className="flex w-full flex-col items-center gap-0.5">
              {gi > 0 && <Separator className="my-1.5 w-8" />}
              <p className="mb-0.5 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                {group.group}
              </p>
              {group.items.map((item) => (
                <Tooltip key={item.action}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() =>
                        setActiveTool(
                          editorState.activeTool === item.action ? null : item.action
                        )
                      }
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
                    {item.label}
                  </TooltipContent>
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

            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Undo2 className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Redo2 className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* PDF canvas */}
          <div
            className="relative flex-1 overflow-auto bg-muted/30"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isDraggingFile && (
              <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl border-4 border-dashed border-primary bg-primary/10">
                <p className="text-lg font-bold text-primary">Drop PDF here</p>
              </div>
            )}

            {pdfUrl ? (
              <div className="flex min-h-full items-start justify-center p-6">
                <PdfViewer
                  url={pdfUrl}
                  page={editorState.currentPage}
                  zoom={editorState.zoom}
                  activeTool={editorState.activeTool}
                  toolColor={toolColor}
                  toolSize={toolSize}
                />
              </div>
            ) : (
              /* Drop zone / open state */
              <div className="flex h-full items-center justify-center p-6">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full max-w-md cursor-pointer flex-col items-center gap-5 rounded-2xl border-2 border-dashed border-border bg-card p-12 text-center transition-all hover:border-primary/50 hover:bg-muted/30 focus:outline-none"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-base font-semibold">Open a PDF to start editing</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Click here or drag & drop a PDF file
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    PDF up to 100MB
                  </Badge>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Right panel ── */}
        <aside className="hidden w-56 shrink-0 flex-col border-l bg-card p-4 lg:flex">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {activeToolLabel ? `${activeToolLabel} Options` : "Properties"}
          </h3>

          {editorState.activeTool ? (
            <div className="space-y-3">
              <ToolOptions
                tool={editorState.activeTool}
                color={toolColor}
                size={toolSize}
                onColorChange={setToolColor}
                onSizeChange={setToolSize}
              />
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Select a tool from the left sidebar to see its options.
            </p>
          )}

          <div className="mt-auto space-y-2">
            <Separator className="mb-3" />
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Page</span>
                <span>{editorState.currentPage} of {editorState.totalPages}</span>
              </div>
              <div className="flex justify-between">
                <span>Zoom</span>
                <span>{editorState.zoom}%</span>
              </div>
              {pdfFile && (
                <div className="flex justify-between">
                  <span>Size</span>
                  <span>{(pdfFile.size / 1024 / 1024).toFixed(1)} MB</span>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      <PaywallModal
        open={showPaywall}
        onClose={() => setShowPaywall(false)}
        toolName="Edit PDF"
      />
    </div>
  );
}

// ─── Contextual tool options ──────────────────────────────────────────────────

interface ToolOptionsProps {
  tool: ToolAction;
  color: string;
  size: number;
  onColorChange: (c: string) => void;
  onSizeChange: (s: number) => void;
}

function ToolOptions({ tool, color, size, onColorChange, onSizeChange }: ToolOptionsProps) {
  const drawColors = ["#000000", "#EF4444", "#3B82F6", "#22C55E", "#F59E0B", "#8B5CF6", "#EC4899", "#FFFFFF"];
  const highlightColors = ["#FDE047", "#86EFAC", "#93C5FD", "#F9A8D4", "#FCA5A5", "#C4B5FD"];
  const sizes = [1, 2, 4, 6, 10, 16];

  const isDrawTool = ["draw", "shapes", "sign", "annotate"].includes(tool);
  const isHighlight = tool === "highlight";
  const isText = ["add-text", "edit-text", "notes"].includes(tool);

  return (
    <div className="space-y-4">
      {/* Color picker */}
      {(isDrawTool || isHighlight || isText) && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Color</p>
          <div className="flex flex-wrap gap-1.5">
            {(isHighlight ? highlightColors : drawColors).map((c) => (
              <button
                key={c}
                onClick={() => onColorChange(c)}
                className={cn(
                  "h-6 w-6 rounded-full border-2 transition-all hover:scale-110",
                  color === c ? "scale-125 border-foreground shadow-sm" : "border-muted"
                )}
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <input
              type="color"
              value={color}
              onChange={(e) => onColorChange(e.target.value)}
              className="h-7 w-7 cursor-pointer rounded border"
              title="Custom color"
            />
            <span className="text-xs text-muted-foreground font-mono">{color}</span>
          </div>
        </div>
      )}

      {/* Brush / stroke size */}
      {isDrawTool && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Size — {size}px
          </p>
          <input
            type="range"
            min={1}
            max={20}
            value={size}
            onChange={(e) => onSizeChange(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex gap-1">
            {sizes.map((s) => (
              <button
                key={s}
                onClick={() => onSizeChange(s)}
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded border text-[10px] transition-colors",
                  size === s ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:bg-muted"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Text tool hint */}
      {isText && (
        <div className="rounded-lg border bg-muted/30 p-2.5 text-xs text-muted-foreground">
          Click anywhere on the PDF to place a text box. Press Escape or click away to confirm.
        </div>
      )}

      {/* Sign hint */}
      {tool === "sign" && (
        <div className="rounded-lg border bg-muted/30 p-2.5 text-xs text-muted-foreground">
          Click on the PDF to place your signature. Drag to move it.
        </div>
      )}

      {/* Erase hint */}
      {tool === "eraser" && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Eraser size</p>
          <input
            type="range"
            min={5}
            max={50}
            value={size * 5}
            onChange={(e) => onSizeChange(Math.round(Number(e.target.value) / 5))}
            className="w-full accent-primary"
          />
        </div>
      )}

      {/* Page tools */}
      {["rotate", "delete-page", "reorder", "split", "merge", "compress", "protect"].includes(tool) && (
        <div className="rounded-lg border bg-amber-50 p-2.5 text-xs text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
          This operation will apply to the current page. Full processing available after download.
        </div>
      )}

      {tool === "find" && (
        <div className="space-y-1.5">
          <input
            type="text"
            placeholder="Search in PDF..."
            className="w-full rounded border bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button className="w-full rounded bg-primary px-2 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">
            Find
          </button>
        </div>
      )}
    </div>
  );
}

function OptionRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}
