"use client";

import { useState } from "react";
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
  RotateCw,
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePdfEditor } from "@/hooks/usePdfEditor";
import type { ToolAction } from "@/types";
import { PaywallModal } from "@/components/checkout/PaywallModal";

const toolbarItems: { action: ToolAction; icon: React.ElementType; label: string }[] = [
  { action: "add-text", icon: Type, label: "Add Text" },
  { action: "sign", icon: PenLine, label: "Sign" },
  { action: "draw", icon: Pencil, label: "Draw" },
  { action: "highlight", icon: Highlighter, label: "Highlight" },
  { action: "annotate", icon: MessageSquare, label: "Annotate" },
  { action: "add-image", icon: ImageIcon, label: "Add Image" },
  { action: "fill-form", icon: ClipboardList, label: "Fill Form" },
  { action: "delete-page", icon: Trash2, label: "Delete Page" },
];

export function EditorLayout() {
  const { editorState, setActiveTool, setZoom, goToPrevPage, goToNextPage } = usePdfEditor();
  const [showPaywall, setShowPaywall] = useState(false);
  const isPremium = false; // TODO: connect to auth

  const handleDownload = () => {
    if (!isPremium) {
      setShowPaywall(true);
    } else {
      // TODO: trigger actual download
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-muted/20">
      {/* Left Sidebar — Tools */}
      <aside className="flex w-16 flex-col items-center gap-1 border-r bg-card py-3 shadow-sm">
        <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <FileText className="h-4 w-4 text-primary" />
        </div>
        <Separator className="mb-2 w-8" />
        {toolbarItems.map((item) => (
          <Tooltip key={item.action}>
            <TooltipTrigger>
              <button
                onClick={() =>
                  setActiveTool(
                    editorState.activeTool === item.action ? null : item.action
                  )
                }
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg transition-all",
                  editorState.activeTool === item.action
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">{item.label}</TooltipContent>
          </Tooltip>
        ))}
      </aside>

      {/* Main Canvas Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Toolbar */}
        <div className="flex h-12 items-center gap-2 border-b bg-card px-4 shadow-sm">
          {/* Page navigation */}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToPrevPage}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground min-w-[80px] text-center">
            {editorState.currentPage} / {editorState.totalPages}
          </span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToNextPage}>
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* Zoom */}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom(editorState.zoom - 10)}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm min-w-[44px] text-center">{editorState.zoom}%</span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom(editorState.zoom + 10)}>
            <ZoomIn className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* Undo / Redo */}
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Redo2 className="h-4 w-4" />
          </Button>

          <div className="flex-1" />

          {editorState.isDirty && (
            <Badge variant="secondary" className="text-xs">Unsaved changes</Badge>
          )}

          <Button variant="outline" size="sm" className="gap-1.5 h-8">
            <Save className="h-3.5 w-3.5" />
            Save
          </Button>
          <Button size="sm" className="gap-1.5 h-8" onClick={handleDownload}>
            <Download className="h-3.5 w-3.5" />
            Download
          </Button>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto p-6">
          <div className="mx-auto flex min-h-full max-w-3xl flex-col items-center gap-4">
            {/* PDF canvas placeholder */}
            <div
              className="relative w-full rounded-xl border-2 border-dashed border-border bg-white shadow-lg"
              style={{
                aspectRatio: "8.5/11",
                transform: `scale(${editorState.zoom / 100})`,
                transformOrigin: "top center",
              }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <FileText className="h-16 w-16 opacity-20" />
                <div className="text-center">
                  <p className="text-sm font-medium">PDF Canvas</p>
                  <p className="text-xs opacity-70">
                    {editorState.activeTool
                      ? `Tool active: ${editorState.activeTool}`
                      : "Select a tool from the sidebar to start editing"}
                  </p>
                </div>
                {/* TODO: Render PDF.js canvas here */}
              </div>

              {/* Active tool indicator */}
              {editorState.activeTool && (
                <div className="absolute top-3 left-3">
                  <Badge className="text-xs capitalize">
                    {editorState.activeTool.replace("-", " ")} active
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Context Panel */}
      <aside className="hidden w-64 flex-col border-l bg-card p-4 lg:flex">
        <h3 className="mb-3 text-sm font-semibold">Properties</h3>
        {editorState.activeTool ? (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground capitalize">
              {editorState.activeTool.replace("-", " ")} options
            </p>
            {/* TODO: render contextual tool options */}
            <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
              Tool-specific controls will appear here when a PDF is loaded and a tool is selected.
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Select a tool from the left sidebar to see its options here.
          </p>
        )}

        <div className="mt-auto">
          <Separator className="mb-4" />
          <div className="space-y-1.5 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Page</span>
              <span>{editorState.currentPage} of {editorState.totalPages}</span>
            </div>
            <div className="flex justify-between">
              <span>Zoom</span>
              <span>{editorState.zoom}%</span>
            </div>
          </div>
        </div>
      </aside>

      <PaywallModal
        open={showPaywall}
        onClose={() => setShowPaywall(false)}
        toolName="Edit PDF"
      />
    </div>
  );
}
