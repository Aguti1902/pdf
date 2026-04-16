"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Download, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, ChevronDown,
  Undo2, Redo2, Save, FileText, Type, PenLine, Pencil,
  Highlighter, Image as ImageIcon, Trash2, ArrowLeft,
  RotateCw, Eraser, MousePointer2, Shapes, Upload, Share2, Loader2,
  Minus, ArrowRight, Underline, Strikethrough,
  Circle, Triangle, Diamond, TextCursor,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePdfEditor } from "@/hooks/usePdfEditor";
import type { ToolAction } from "@/types";
import type { Annotation, PdfViewerProps, TextBox, LiveLine, TextEdit } from "./PdfViewer";
import { hitTest } from "./PdfViewer";
import { PaywallModal } from "@/components/checkout/PaywallModal";
import { SignatureModal } from "./SignatureModal";
import { AuthModal } from "@/components/auth/AuthModal";
import Link from "next/link";

const PdfViewer = dynamic<PdfViewerProps>(() => import("./PdfViewer"), { ssr: false });

// ─── Tool icons (static) ───────────────────────────────────────────────────────
const TOOL_ICON_MAP: Record<ToolAction, React.ElementType> = {
  pointer: MousePointer2, "add-text": Type, "text-edit": TextCursor, draw: Pencil, highlight: Highlighter,
  shapes: Shapes, eraser: Eraser, sign: PenLine, "add-image": ImageIcon,
  rotate: RotateCw, "delete-page": Trash2,
  line: Minus, arrow: ArrowRight, underline: Underline, strikethrough: Strikethrough,
  ellipse: Circle, triangle: Triangle, diamond: Diamond,
};

const CURSORS: Partial<Record<ToolAction, string>> = {
  "add-text": "text", "text-edit": "text", sign: "crosshair", draw: "crosshair",
  highlight: "crosshair", shapes: "crosshair", "add-image": "copy",
  eraser: "cell", pointer: "default",
  line: "crosshair", arrow: "crosshair", underline: "crosshair", strikethrough: "crosshair",
  ellipse: "crosshair", triangle: "crosshair", diamond: "crosshair",
};

// ─── EditorLayout ─────────────────────────────────────────────────────────────

export function EditorLayout() {
  const { editorState, setActiveTool, setZoom, setTotalPages, goToPrevPage, goToNextPage } = usePdfEditor();
  const searchParams = useSearchParams();
  const { t, messages } = useLanguage();
  const editorT = messages ? t("editor") : null;

  const TOOL_GROUPS = useMemo(() => {
    const tr = editorT?.tools;
    return [
      {
        group: editorT?.groupEdit ?? "Edit",
        items: [
          { action: "pointer"   as ToolAction, icon: TOOL_ICON_MAP.pointer,      label: tr?.pointer    ?? "Select / Move",  desc: tr?.pointerDesc   ?? "Select and move elements" },
          { action: "add-text"  as ToolAction, icon: TOOL_ICON_MAP["add-text"],  label: tr?.addText    ?? "Add Text",       desc: tr?.addTextDesc   ?? "Click to add a text box" },
          { action: "text-edit" as ToolAction, icon: TOOL_ICON_MAP["text-edit"], label: "Edit Text",      desc: "Click on any existing text to edit it inline" },
          { action: "draw"          as ToolAction, icon: TOOL_ICON_MAP.draw,          label: tr?.draw      ?? "Draw",          desc: tr?.drawDesc      ?? "Freehand drawing" },
          { action: "highlight"     as ToolAction, icon: TOOL_ICON_MAP.highlight,     label: tr?.highlight ?? "Highlight",     desc: tr?.highlightDesc ?? "Highlight areas" },
          { action: "underline"     as ToolAction, icon: TOOL_ICON_MAP.underline,     label: "Underline",     desc: "Draw underline" },
          { action: "strikethrough" as ToolAction, icon: TOOL_ICON_MAP.strikethrough, label: "Strikethrough", desc: "Draw strikethrough" },
          { action: "line"          as ToolAction, icon: TOOL_ICON_MAP.line,          label: "Line",          desc: "Draw a straight line" },
          { action: "arrow"         as ToolAction, icon: TOOL_ICON_MAP.arrow,         label: "Arrow",         desc: "Draw an arrow" },
          { action: "shapes"        as ToolAction, icon: TOOL_ICON_MAP.shapes,        label: tr?.shapes    ?? "Rectangle", desc: tr?.shapesDesc ?? "Draw a rectangle" },
          { action: "ellipse"       as ToolAction, icon: TOOL_ICON_MAP.ellipse,       label: "Ellipse",       desc: "Draw an ellipse/circle" },
          { action: "triangle"      as ToolAction, icon: TOOL_ICON_MAP.triangle,      label: "Triangle",      desc: "Draw a triangle" },
          { action: "diamond"       as ToolAction, icon: TOOL_ICON_MAP.diamond,       label: "Diamond",       desc: "Draw a diamond" },
          { action: "eraser"        as ToolAction, icon: TOOL_ICON_MAP.eraser,        label: tr?.eraser    ?? "Eraser",    desc: tr?.eraserDesc    ?? "Erase drawings" },
        ],
      },
      {
        group: editorT?.groupInsert ?? "Insert",
        items: [
          { action: "sign"      as ToolAction, icon: TOOL_ICON_MAP.sign,        label: tr?.sign      ?? "Sign",          desc: tr?.signDesc      ?? "Create and place a signature" },
          { action: "add-image" as ToolAction, icon: TOOL_ICON_MAP["add-image"], label: tr?.addImage ?? "Add Image",     desc: tr?.addImageDesc  ?? "Click to insert an image" },
        ],
      },
      {
        group: editorT?.groupPages ?? "Pages",
        items: [
          { action: "rotate"      as ToolAction, icon: TOOL_ICON_MAP.rotate,        label: tr?.rotatePage ?? "Rotate Page",  desc: tr?.rotatePageDesc ?? "Rotate this page 90°" },
          { action: "delete-page" as ToolAction, icon: TOOL_ICON_MAP["delete-page"], label: tr?.deletePage ?? "Delete Page",  desc: tr?.deletePageDesc ?? "Remove this page" },
        ],
      },
    ];
  }, [editorT]);

  const ALL_TOOLS = useMemo(() => TOOL_GROUPS.flatMap(g => g.items), [TOOL_GROUPS]);

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
  const [liveRect,    setLiveRect]    = useState<{ x:number;y:number;w:number;h:number;color:string;type:"highlight"|"shape"|"ellipse"|"triangle"|"diamond"|"underline"|"strikethrough";size:number } | null>(null);
  const [textBoxes,        setTextBoxes]        = useState<TextBox[]>([]);
  const [activeTextBoxId,  setActiveTextBoxId]  = useState<string | null>(null);
  const [selectedTextBoxId,setSelectedTextBoxId]= useState<string | null>(null);
  const [selectedId,       setSelectedId]       = useState<string | null>(null);
  const [liveLine,         setLiveLine]         = useState<LiveLine | null>(null);
  const [textEdits,        setTextEdits]        = useState<TextEdit[]>([]);

  // Tool options
  const [toolColor, setToolColor] = useState("#EF4444");
  const [toolSize,  setToolSize]  = useState(3);

  // Font panel state (for add-text and text-edit tools)
  const [fontFamily, setFontFamily]       = useState("Helvetica");
  const [fontSize, setFontSize]           = useState(12);
  const [fontColor, setFontColor]         = useState("#000000");
  const [isBold, setIsBold]               = useState(false);
  const [isItalic, setIsItalic]           = useState(false);
  const [isUnderlineFp, setIsUnderlineFp] = useState(false);
  const [bgColor, setBgColor]             = useState("#deded1");
  const [bgTransparent, setBgTransparent] = useState(true);

  // Modals — auth → paywall in sequence
  const [showAuth,      setShowAuth]      = useState(false);
  const [showPaywall,   setShowPaywall]   = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);
  const [userEmail,       setUserEmail]       = useState("");
  const [userName,        setUserName]        = useState("");
  const [isPremiumReal,   setIsPremiumReal]   = useState(false);
  const [hadSubscription, setHadSubscription] = useState(false);
  const [pendingAction, setPendingAction] = useState<"save" | "download" | null>(null);
  const [docId,         setDocId]         = useState<string | null>(null);
  const [isSaving,      setIsSaving]      = useState(false);

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
  // Always-current page number, safe to read inside any callback without stale-closure issues
  const currentPageRef  = useRef(editorState.currentPage);

  const isPremium = isPremiumReal;

  // Keep currentPageRef always up-to-date so callbacks don't have stale page values
  useEffect(() => { currentPageRef.current = editorState.currentPage; }, [editorState.currentPage]);

  // Check subscription status on mount
  const checkSubscription = useCallback(async () => {
    try {
      const res = await fetch("/api/subscription");
      if (res.ok) {
        const data = await res.json();
        setIsPremiumReal(data.isPremium === true);
        if (data.hadSubscription) setHadSubscription(true);
      }
    } catch { /* offline */ }
  }, []);

  // Also fetch current user on mount
  const fetchMe = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUserEmail(data.user.email);
          setUserName(data.user.name ?? "");
        }
      }
    } catch { /* offline */ }
  }, []);

  // Compute Google OAuth redirect URL for the editor (includes postAuth param)
  const buildGoogleRedirect = useCallback((action: "download" | "save") => {
    if (typeof window === "undefined") return "/dashboard";
    const base = window.location.pathname + window.location.search;
    const sep  = base.includes("?") ? "&" : "?";
    return `${base}${sep}postAuth=${action}`;
  }, []);

  // Save current PDF to sessionStorage so it can be restored after Google OAuth
  const persistFileForGoogleRedirect = useCallback(async () => {
    if (!pdfFile) return;
    try {
      const buf = await pdfFile.arrayBuffer();
      const bytes = new Uint8Array(buf);
      let binary = "";
      for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
      const dataUrl = `data:application/pdf;base64,${btoa(binary)}`;
      sessionStorage.setItem("pdfcraft_restore", JSON.stringify({ dataUrl, name: pdfFile.name }));
    } catch { /* sessionStorage full or unavailable */ }
  }, [pdfFile]);

  // Run on mount — restore file from sessionStorage if fileId or restore param is in URL
  useEffect(() => {
    checkSubscription();
    fetchMe();

    const fileId   = searchParams?.get("fileId");
    const postAuth = searchParams?.get("postAuth") as "download" | "save" | null;
    const restore  = searchParams?.get("restore");
    const toolParam = searchParams?.get("tool");

    // Pre-select tool if provided via URL (e.g. from tool landing pages)
    if (toolParam) {
      const validTools = ["pointer","add-text","text-edit","draw","highlight","shapes","ellipse","triangle","diamond","eraser","line","arrow","underline","strikethrough","sign","add-image","rotate","delete-page"];
      if (validTools.includes(toolParam)) {
        setTimeout(() => setActiveTool(toolParam as import("@/types").ToolAction), 200);
      }
    }

    // Restore from standard fileId upload
    if (fileId) {
      try {
        const stored = sessionStorage.getItem(`pdfcraft_file_${fileId}`);
        if (stored) {
          const { dataUrl, name } = JSON.parse(stored) as { dataUrl: string; name: string; id: string };
          fetch(dataUrl)
            .then(r => r.blob())
            .then(blob => {
              const file = new File([blob], name, { type: "application/pdf" });
              loadFile(file);
              sessionStorage.removeItem(`pdfcraft_file_${fileId}`);
            })
            .catch(() => {/* ignore */});
        }
      } catch {/* sessionStorage unavailable */}
    }

    // Restore from Google OAuth redirect (file saved before leaving)
    if (restore === "1") {
      try {
        const stored = sessionStorage.getItem("pdfcraft_restore");
        if (stored) {
          const { dataUrl, name } = JSON.parse(stored) as { dataUrl: string; name: string };
          fetch(dataUrl)
            .then(r => r.blob())
            .then(blob => {
              const file = new File([blob], name, { type: "application/pdf" });
              loadFile(file);
              sessionStorage.removeItem("pdfcraft_restore");
              // Show paywall after file loads
              if (postAuth === "download") {
                setTimeout(() => setShowPaywall(true), 600);
              } else if (postAuth === "save") {
                setTimeout(() => saveDocument(), 600);
              }
            })
            .catch(() => {/* ignore */});
        }
      } catch {/* ignore */}
    } else if (postAuth) {
      // Came back from Google OAuth without a file to restore (e.g. from dashboard link)
      if (postAuth === "download") setTimeout(() => setShowPaywall(true), 400);
      else if (postAuth === "save") setTimeout(() => saveDocument(), 400);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── History ──────────────────────────────────────────────────────────────────
  const commit = useCallback((next: Annotation[], selectId?: string) => {
    // Stamp annotations that don't yet have a page with the current page number (via ref — always fresh)
    const pg = currentPageRef.current;
    const stamped = next.map(ann => ann.page !== undefined ? ann : { ...ann, page: pg });
    setAnnotations(stamped);
    setHistory(h => [...h.slice(0, historyIdx + 1), stamped]);
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
      setSelectedTextBoxId(null);
      return;
    }
    if (tool === "draw") setLiveStroke({ points: [{ x, y }], color: toolColor, size: toolSize });
    if (tool === "highlight" || tool === "shapes" || tool === "ellipse" || tool === "triangle" || tool === "diamond") {
      dragStart.current = { x, y };
      const shapeType = tool === "highlight" ? "highlight" : tool === "shapes" ? "shape" : tool as "ellipse" | "triangle" | "diamond";
      setLiveRect({ x, y, w: 0, h: 0, color: toolColor, type: shapeType, size: toolSize });
    }
    if (tool === "underline" || tool === "strikethrough") {
      dragStart.current = { x, y };
      setLiveRect({ x, y, w: 0, h: 0, color: toolColor, type: tool as "underline" | "strikethrough", size: toolSize });
    }
    if (tool === "line" || tool === "arrow") {
      dragStart.current = { x, y };
    }
    if (tool === "add-text") {
      const id = crypto.randomUUID();
      setTextBoxes(prev => [...prev, {
        id, x, y, value: "", color: fontColor,
        placeholder: "Type here...", page: currentPageRef.current,
        fontFamily, fontSize, fontWeight: isBold ? "bold" : "normal",
        fontStyle: isItalic ? "italic" : "normal",
        textDecoration: isUnderlineFp ? "underline" : "none",
      }]);
      setActiveTextBoxId(id);
      setSelectedTextBoxId(null);
    }
    if (tool === "add-image") { pendingImagePos.current = { x, y }; imageInputRef.current?.click(); }
  }, [editorState.activeTool, toolColor, toolSize, fontColor, fontFamily, fontSize, isBold, isItalic, isUnderlineFp, annotations, setActiveTool]);

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
    if ((tool === "highlight" || tool === "shapes" || tool === "ellipse" || tool === "triangle" || tool === "diamond" || tool === "underline" || tool === "strikethrough") && dragStart.current) {
      const { x: sx, y: sy } = dragStart.current;
      setLiveRect(p => p ? { ...p, x: Math.min(sx,x), y: Math.min(sy,y), w: Math.abs(x-sx), h: Math.abs(y-sy) } : null);
    }
    if ((tool === "line" || tool === "arrow") && dragStart.current) {
      setLiveLine({ x1: dragStart.current.x, y1: dragStart.current.y, x2: x, y2: y, color: toolColor, size: toolSize, type: tool as "line" | "arrow" });
    }
    if (tool === "eraser") {
      const r = toolSize * 15;
      setAnnotations(prev => prev.filter(a => a.type !== "draw" || !a.points.some(p => Math.hypot(p.x-x, p.y-y) < r)));
    }
  }, [editorState.activeTool, toolColor, toolSize, selectedId]);

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
    if ((tool === "highlight" || tool === "shapes" || tool === "ellipse" || tool === "triangle" || tool === "diamond" || tool === "underline" || tool === "strikethrough") && liveRect && liveRect.w > 4)
      commit([...annotations, { id: newId, type: liveRect.type, x: liveRect.x, y: liveRect.y, w: liveRect.w, h: liveRect.h, color: liveRect.color, size: liveRect.size }], newId);
    if ((tool === "line" || tool === "arrow") && liveLine && Math.hypot(liveLine.x2 - liveLine.x1, liveLine.y2 - liveLine.y1) > 5)
      commit([...annotations, { id: newId, type: tool as "line" | "arrow", x1: liveLine.x1, y1: liveLine.y1, x2: liveLine.x2, y2: liveLine.y2, color: liveLine.color, size: liveLine.size }], newId);
    if (tool === "eraser") commit(annotations);

    setLiveStroke(null); setLiveRect(null); setLiveLine(null); dragStart.current = null;
  }, [editorState.activeTool, liveStroke, liveRect, liveLine, annotations, commit]);

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
  const handleTextBoxBlur   = useCallback((id: string, value: string) => {
    setTextBoxes(p => p.map(tb => tb.id === id ? { ...tb, value } : tb));
    setActiveTextBoxId(null);
  }, []);
  const handleTextBoxDelete = useCallback((id: string) => {
    setTextBoxes(p => p.filter(tb => tb.id !== id));
    setActiveTextBoxId(prev  => prev  === id ? null : prev);
    setSelectedTextBoxId(prev => prev === id ? null : prev);
  }, []);
  const handleTextBoxSelect   = useCallback((id: string) => {
    setSelectedTextBoxId(id);
    const tb = textBoxes.find(t => t.id === id);
    if (tb) {
      if (tb.fontFamily)    setFontFamily(tb.fontFamily);
      if (tb.fontSize)      setFontSize(tb.fontSize);
      if (tb.color)         setFontColor(tb.color);
      setIsBold(tb.fontWeight === "bold");
      setIsItalic(tb.fontStyle === "italic");
      setIsUnderlineFp(tb.textDecoration === "underline");
    }
  }, [textBoxes]);
  const handleTextBoxMove     = useCallback((id: string, x: number, y: number) =>
    setTextBoxes(p => p.map(tb => tb.id === id ? { ...tb, x, y } : tb)), []);
  const handleTextBoxActivate = useCallback((id: string) => {
    setActiveTextBoxId(id);
    setSelectedTextBoxId(null);
    const tb = textBoxes.find(t => t.id === id);
    if (tb) {
      if (tb.fontFamily)    setFontFamily(tb.fontFamily);
      if (tb.fontSize)      setFontSize(tb.fontSize);
      if (tb.color)         setFontColor(tb.color);
      setIsBold(tb.fontWeight === "bold");
      setIsItalic(tb.fontStyle === "italic");
      setIsUnderlineFp(tb.textDecoration === "underline");
    }
  }, [textBoxes]);

  // ── Sync Font panel → active/selected text box in real time ──────────────
  useEffect(() => {
    const targetId = activeTextBoxId ?? selectedTextBoxId;
    if (!targetId) return;
    setTextBoxes(prev => prev.map(tb => tb.id !== targetId ? tb : {
      ...tb,
      color: fontColor,
      fontFamily,
      fontSize,
      fontWeight: isBold ? "bold" : "normal",
      fontStyle: isItalic ? "italic" : "normal",
      textDecoration: isUnderlineFp ? "underline" : "none",
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fontFamily, fontSize, fontColor, isBold, isItalic, isUnderlineFp]);

  // ── Native text edit handlers ──────────────────────────────────────────────
  const handleTextEditCommit = useCallback((edit: TextEdit) => {
    setTextEdits(prev => {
      const filtered = prev.filter(e => e.id !== edit.id);
      // If new text is blank or same as original → restore (no edit stored)
      if (!edit.newText.trim() || edit.newText.trim() === edit.originalText.trim()) return filtered;
      return [...filtered, edit];
    });
  }, []);

  const handleTextEditDelete = useCallback((editId: string) => {
    setTextEdits(prev => prev.filter(e => e.id !== editId));
  }, []);

  // ── Page ops ──────────────────────────────────────────────────────────────────
  const rotatePage = () => setPageRotation(r => (r + 90) % 360);
  const deletePage = () => {
    setDeletedPages(p => new Set([...p, editorState.currentPage]));
    goToNextPage();
  };

  // ── Save document to dashboard ──────────────────────────────────────────────
  // Saving is FREE for all logged-in users — no subscription required.
  // Download is the paid action.
  const saveDocument = useCallback(async () => {
    if (!pdfFile || !pdfUrl) return;
    if (!userEmail) { setPendingAction("save"); setShowAuth(true); return; }

    setIsSaving(true);
    try {
      // Export the PDF with ALL edits baked in (annotations, text boxes, text edits, rotation, deleted pages)
      const { exportEditorPdf } = await import("@/lib/pdf-processing/exportEditorPdf");
      const blob = await exportEditorPdf({ pdfFile, annotations, textBoxes, textEdits, pageRotation, deletedPages });

      const arrayBuf = await blob.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuf);
      let binary = "";
      const CHUNK = 8192;
      for (let i = 0; i < uint8.length; i += CHUNK) {
        binary += String.fromCharCode(...uint8.subarray(i, i + CHUNK));
      }
      const base64 = btoa(binary);

      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id:          docId ?? undefined,
          title:       fileName,
          fileData:    base64,
          fileSize:    blob.size,
          annotations: [],
          pageCount:   editorState.totalPages - deletedPages.size,
        }),
      });
      if (!res.ok) throw new Error();
      const { document: doc } = await res.json();
      setDocId(doc.id);
      const { toast } = await import("sonner");
      toast.success("Document saved! Redirecting to your dashboard…");
      setTimeout(() => { window.location.href = "/dashboard"; }, 900);
    } catch {
      const { toast } = await import("sonner");
      toast.error("Could not save document. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }, [pdfFile, pdfUrl, userEmail, fileName, docId, annotations, textBoxes, textEdits, pageRotation, deletedPages, editorState.totalPages]);

  // ── Download / Share flow: Auth → Paywall ─────────────────────────────────────
  const [isExporting, setIsExporting] = useState(false);

  const doExportDownload = useCallback(async () => {
    if (!pdfFile) return;
    setIsExporting(true);
    try {
      const { exportEditorPdf } = await import("@/lib/pdf-processing/exportEditorPdf");
      const blob = await exportEditorPdf({ pdfFile, annotations, textBoxes, textEdits, pageRotation, deletedPages });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = fileName; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (err) {
      console.error("[export]", err);
      // Fallback: download original without annotations
      const a = document.createElement("a");
      a.href = pdfUrl!; a.download = fileName; a.click();
    } finally {
      setIsExporting(false);
    }
  }, [pdfFile, pdfUrl, annotations, textBoxes, pageRotation, deletedPages, fileName]);

  const startDownload = () => {
    if (!pdfUrl) return;
    if (!userEmail) { setPendingAction("download"); setShowAuth(true); return; }
    if (!isPremium) { setPendingAction("download"); setShowPaywall(true); return; }
    doExportDownload();
  };

  const onAuthSuccess = async (email: string, name: string) => {
    setUserEmail(email);
    setUserName(name);
    setShowAuth(false);
    // Re-check subscription
    await checkSubscription();
    const { toast } = await import("sonner");
    toast.success(`Welcome, ${name}!`);
    // Continue pending action
    if (pendingAction === "download") { setPendingAction(null); setShowPaywall(true); }
    else if (pendingAction === "save") { setPendingAction(null); setTimeout(() => saveDocument(), 300); }
    else setPendingAction(null);
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
        <span className="hidden font-bold text-sm sm:block">PDFCraft</span>
        <Separator orientation="vertical" className="h-5" />
        <span className="max-w-[180px] truncate text-sm text-muted-foreground sm:max-w-xs">{fileName}</span>
        {pdfFile && <Badge variant="secondary" className="hidden text-xs sm:flex">{(pdfFile.size / 1024 / 1024).toFixed(1)} MB</Badge>}
        <div className="flex-1" />
        {activeItem && <Badge className="hidden text-xs md:flex">{activeItem.label}</Badge>}
        <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={() => fileInputRef.current?.click()}>
          <Upload className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{editorT?.openPdf ?? "Open PDF"}</span>
        </Button>
        <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={saveDocument} disabled={isSaving || !pdfUrl}>
          <Save className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{isSaving ? (editorT?.saving ?? "Saving...") : (editorT?.save ?? "Save")}</span>
        </Button>
        <Button size="sm" className="h-8 gap-1.5 font-semibold" onClick={startDownload} disabled={!pdfUrl || isExporting}>
          {isExporting
            ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> {editorT?.saving ?? "Exporting…"}</>
            : <><Download className="h-3.5 w-3.5" /> {editorT?.download ?? "Download"}</>}
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
                    <p className="font-medium text-primary-foreground">{item.label}</p>
                    <p className="text-primary-foreground/70">{item.desc}</p>
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
            {userEmail && (
              <span className="text-xs text-muted-foreground hidden md:inline">{userEmail}</span>
            )}
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
                  annotations={annotations.filter(a => !a.page || a.page === editorState.currentPage)}
                  textBoxes={textBoxes.filter(tb => !tb.page || tb.page === editorState.currentPage)}
                  activeTextBoxId={activeTextBoxId}
                  selectedTextBoxId={selectedTextBoxId}
                  selectedId={selectedId}
                  cursor={cursor}
                  liveStroke={liveStroke}
                  liveRect={liveRect}
                  liveLine={liveLine}
                  onPdfLoaded={setTotalPages}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMoveWithRotate}
                  onMouseUp={handleMouseUp}
                  onTextBoxBlur={handleTextBoxBlur}
                  onTextBoxDelete={handleTextBoxDelete}
                  onTextBoxSelect={handleTextBoxSelect}
                  onTextBoxMove={handleTextBoxMove}
                  onTextBoxActivate={handleTextBoxActivate}
                  onRotateStart={handleRotateStart}
                  tool={editorState.activeTool ?? "pointer"}
                  textEdits={textEdits.filter(e => e.page === editorState.currentPage)}
                  onTextEditCommit={handleTextEditCommit}
                  onTextEditDelete={handleTextEditDelete}
                  onTextItemSelect={(item) => {
                    const familyMatch = item.fontFamily.match(/"([^"]+)"/);
                    if (familyMatch) setFontFamily(familyMatch[1]);
                    setFontSize(Math.round(item.pdfFontSize));
                    setFontColor(item.color);
                    setIsBold(item.fontWeight === "bold");
                    setIsItalic(item.fontStyle === "italic");
                    setIsUnderlineFp(false);
                  }}
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
                    <p className="text-base font-semibold">{editorT?.openToStart ?? "Open a PDF to start editing"}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{editorT?.clickOrDrop ?? "Click here or drag & drop your PDF"}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">PDF up to 100MB</Badge>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Right panel ── */}
        <aside className="hidden w-56 shrink-0 flex-col border-l bg-card p-4 lg:flex overflow-y-auto">
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
              fontFamily={fontFamily} fontSize={fontSize} fontColor={fontColor}
              isBold={isBold} isItalic={isItalic} isUnderline={isUnderlineFp}
              bgColor={bgColor} bgTransparent={bgTransparent}
              onFontFamilyChange={setFontFamily} onFontSizeChange={setFontSize}
              onFontColorChange={setFontColor}
              onBoldToggle={() => setIsBold(v => !v)} onItalicToggle={() => setIsItalic(v => !v)}
              onUnderlineToggle={() => setIsUnderlineFp(v => !v)}
              onBgColorChange={setBgColor} onBgTransparentToggle={() => setBgTransparent(v => !v)}
            />
          ) : (
            <p className="text-xs text-muted-foreground">Select a tool to get started.</p>
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
      <AuthModal
        open={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={onAuthSuccess}
        googleRedirectTo={
          typeof window !== "undefined"
            ? (() => {
                const action = pendingAction ?? "download";
                const base = window.location.pathname + window.location.search;
                const sep  = base.includes("?") ? "&" : "?";
                return `${base}${sep}restore=1&postAuth=${action}`;
              })()
            : "/dashboard"
        }
        onBeforeGoogleNavigate={persistFileForGoogleRedirect}
      />
      <PaywallModal
        open={showPaywall}
        onClose={() => setShowPaywall(false)}
        toolName="Download PDF"
        userEmail={userEmail}
        userName={userName}
        hadSubscription={hadSubscription}
        onPaymentSuccess={() => { setShowPaywall(false); doExportDownload(); }}
      />
      {showSignModal && <SignatureModal onConfirm={handleSignaturePlaced} onClose={() => setShowSignModal(false)} />}
    </div>
  );
}

// ─── Type alias to silence import-only use ────────────────────────────────────
type DrawAnnotation = Extract<Annotation, { type: "draw" }>;

// ─── Font families available in the Font panel ───────────────────────────────
const FONT_FAMILIES = [
  "Helvetica", "Arial", "Inter", "Times New Roman", "Georgia",
  "Courier New", "Verdana", "Trebuchet MS", "Calibri", "Cambria",
  "Palatino", "Garamond", "Roboto", "Open Sans", "Lato",
  "Montserrat", "Poppins",
];

// ─── Font Properties Panel (like the reference editor) ────────────────────────
function FontPanel({ fontFamily, fontSize, fontColor, isBold, isItalic, isUnderline,
  bgColor, bgTransparent,
  onFontFamilyChange, onFontSizeChange, onFontColorChange,
  onBoldToggle, onItalicToggle, onUnderlineToggle,
  onBgColorChange, onBgTransparentToggle,
}: {
  fontFamily: string; fontSize: number; fontColor: string;
  isBold: boolean; isItalic: boolean; isUnderline: boolean;
  bgColor: string; bgTransparent: boolean;
  onFontFamilyChange: (f: string) => void; onFontSizeChange: (s: number) => void;
  onFontColorChange: (c: string) => void;
  onBoldToggle: () => void; onItalicToggle: () => void; onUnderlineToggle: () => void;
  onBgColorChange: (c: string) => void; onBgTransparentToggle: () => void;
}) {
  return (
    <div className="space-y-4 text-xs">
      {/* ── Font ── */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-[11px]">Font</p>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </div>
        <select
          value={fontFamily}
          onChange={e => onFontFamilyChange(e.target.value)}
          className="w-full rounded-md border bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {FONT_FAMILIES.map(f => (
            <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={fontSize}
            onChange={e => onFontSizeChange(Math.max(1, Number(e.target.value)))}
            min={1} max={200}
            className="w-14 rounded-md border bg-background px-2 py-1.5 text-xs text-center focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <div className="flex items-center gap-0.5 rounded-md border bg-background p-0.5">
            <input type="color" value={fontColor} onChange={e => onFontColorChange(e.target.value)}
              className="h-6 w-6 cursor-pointer rounded border-none" />
          </div>
          <span className="font-mono text-muted-foreground text-[10px]">{fontColor}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onBoldToggle}
            className={cn("flex h-7 w-7 items-center justify-center rounded border text-xs font-bold transition-colors",
              isBold ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:bg-muted")}>
            B
          </button>
          <button onClick={onItalicToggle}
            className={cn("flex h-7 w-7 items-center justify-center rounded border text-xs italic transition-colors",
              isItalic ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:bg-muted")}>
            I
          </button>
          <button onClick={onUnderlineToggle}
            className={cn("flex h-7 w-7 items-center justify-center rounded border text-xs underline transition-colors",
              isUnderline ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:bg-muted")}>
            U
          </button>
          <Separator orientation="vertical" className="mx-1 h-5" />
          <button className="flex h-7 w-7 items-center justify-center rounded border bg-background text-xs hover:bg-muted transition-colors" title="Align left">
            <AlignLeft className="h-3.5 w-3.5" />
          </button>
          <button className="flex h-7 w-7 items-center justify-center rounded border bg-background text-xs hover:bg-muted transition-colors" title="Align center">
            <AlignCenter className="h-3.5 w-3.5" />
          </button>
          <button className="flex h-7 w-7 items-center justify-center rounded border bg-background text-xs hover:bg-muted transition-colors" title="Align right">
            <AlignRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <Separator />

      {/* ── Paragraph ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-[11px]">Paragraph</p>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-1">
          <button className="flex h-7 w-7 items-center justify-center rounded border bg-primary text-primary-foreground text-xs" title="Align left">
            <AlignLeft className="h-3.5 w-3.5" />
          </button>
          <button className="flex h-7 w-7 items-center justify-center rounded border bg-background text-xs hover:bg-muted" title="Align center">
            <AlignCenter className="h-3.5 w-3.5" />
          </button>
          <button className="flex h-7 w-7 items-center justify-center rounded border bg-background text-xs hover:bg-muted" title="Align right">
            <AlignRight className="h-3.5 w-3.5" />
          </button>
          <button className="flex h-7 w-7 items-center justify-center rounded border bg-background text-xs hover:bg-muted" title="Justify">
            <AlignJustify className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <Separator />

      {/* ── Background ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-[11px]">Background</p>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-2">
          <input type="color" value={bgColor} onChange={e => onBgColorChange(e.target.value)}
            className="h-6 w-6 cursor-pointer rounded border" />
          <span className="font-mono text-muted-foreground text-[10px]">{bgColor}</span>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={bgTransparent} onChange={onBgTransparentToggle}
            className="h-3.5 w-3.5 rounded border accent-primary" />
          <span className="text-[11px]">Transparent</span>
        </label>
      </div>
    </div>
  );
}

// ─── Tool Options Panel ───────────────────────────────────────────────────────

function ToolOptions({ tool, color, size, selectedId, onColorChange, onSizeChange, onDeleteSelected, onOpenSignModal,
  fontFamily, fontSize, fontColor, isBold, isItalic, isUnderline, bgColor, bgTransparent,
  onFontFamilyChange, onFontSizeChange, onFontColorChange,
  onBoldToggle, onItalicToggle, onUnderlineToggle,
  onBgColorChange, onBgTransparentToggle,
}: {
  tool: ToolAction; color: string; size: number; selectedId?: string | null;
  onColorChange: (c: string) => void; onSizeChange: (s: number) => void;
  onDeleteSelected?: () => void; onOpenSignModal?: () => void;
  fontFamily: string; fontSize: number; fontColor: string;
  isBold: boolean; isItalic: boolean; isUnderline: boolean;
  bgColor: string; bgTransparent: boolean;
  onFontFamilyChange: (f: string) => void; onFontSizeChange: (s: number) => void;
  onFontColorChange: (c: string) => void;
  onBoldToggle: () => void; onItalicToggle: () => void; onUnderlineToggle: () => void;
  onBgColorChange: (c: string) => void; onBgTransparentToggle: () => void;
}) {
  const COLORS = ["#000000","#EF4444","#3B82F6","#22C55E","#F59E0B","#8B5CF6","#EC4899","#FFFFFF"];
  const HL_COLORS = ["#FDE047","#86EFAC","#93C5FD","#F9A8D4","#FCA5A5","#C4B5FD"];
  const SIZES = [1, 2, 4, 6, 10, 16];

  const isDrawable  = ["draw", "shapes", "ellipse", "triangle", "diamond", "line", "arrow", "underline", "strikethrough"].includes(tool);
  const isHighlight = tool === "highlight";
  const isTextTool  = tool === "add-text" || tool === "text-edit";

  if (isTextTool) {
    return (
      <FontPanel
        fontFamily={fontFamily} fontSize={fontSize} fontColor={fontColor}
        isBold={isBold} isItalic={isItalic} isUnderline={isUnderline}
        bgColor={bgColor} bgTransparent={bgTransparent}
        onFontFamilyChange={onFontFamilyChange} onFontSizeChange={onFontSizeChange}
        onFontColorChange={onFontColorChange}
        onBoldToggle={onBoldToggle} onItalicToggle={onItalicToggle} onUnderlineToggle={onUnderlineToggle}
        onBgColorChange={onBgColorChange} onBgTransparentToggle={onBgTransparentToggle}
      />
    );
  }

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

      {tool === "sign" && (
        <div className="space-y-2">
          <p className="text-muted-foreground">Create your signature and place it anywhere on the document.</p>
          <button onClick={onOpenSignModal}
            className="w-full rounded-lg border-2 border-primary bg-primary/5 py-2 text-xs font-medium text-primary hover:bg-primary/10 transition-colors">
            Create signature
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
                Delete selected
              </button>
            </>
          ) : (
            <div className="rounded-lg border bg-muted/40 p-2.5 text-xs text-muted-foreground leading-relaxed">
              Select a tool to get started.
            </div>
          )}
        </div>
      )}

      {tool === "rotate" && (
        <div className="rounded-lg border bg-blue-50 p-2.5 text-xs text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 leading-relaxed">
          Click the Rotate Page button to rotate 90° clockwise.
        </div>
      )}
      {tool === "delete-page" && (
        <div className="rounded-lg border bg-red-50 p-2.5 text-xs text-red-700 dark:bg-red-900/20 dark:text-red-300 leading-relaxed">
          Deletes the current page from the editor. You can restore it from the canvas.
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
