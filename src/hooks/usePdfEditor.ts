"use client";

import { useState, useCallback } from "react";
import type { EditorState, ToolAction } from "@/types";

const DEFAULT_STATE: EditorState = {
  activeTool: null,
  currentPage: 1,
  totalPages: 1,
  zoom: 100,
  isDirty: false,
};

export function usePdfEditor() {
  const [editorState, setEditorState] = useState<EditorState>(DEFAULT_STATE);

  const setActiveTool = useCallback((tool: ToolAction | null) => {
    setEditorState((prev) => ({ ...prev, activeTool: tool }));
  }, []);

  const setCurrentPage = useCallback((page: number) => {
    setEditorState((prev) => ({
      ...prev,
      currentPage: Math.min(Math.max(1, page), prev.totalPages),
    }));
  }, []);

  const setZoom = useCallback((zoom: number) => {
    setEditorState((prev) => ({
      ...prev,
      zoom: Math.min(Math.max(50, zoom), 200),
    }));
  }, []);

  const setTotalPages = useCallback((total: number) => {
    setEditorState((prev) => ({ ...prev, totalPages: total }));
  }, []);

  const markDirty = useCallback(() => {
    setEditorState((prev) => ({ ...prev, isDirty: true }));
  }, []);

  const reset = useCallback(() => {
    setEditorState(DEFAULT_STATE);
  }, []);

  const goToPrevPage = useCallback(() => {
    setEditorState((prev) => ({
      ...prev,
      currentPage: Math.max(1, prev.currentPage - 1),
    }));
  }, []);

  const goToNextPage = useCallback(() => {
    setEditorState((prev) => ({
      ...prev,
      currentPage: Math.min(prev.totalPages, prev.currentPage + 1),
    }));
  }, []);

  return {
    editorState,
    setActiveTool,
    setCurrentPage,
    setZoom,
    setTotalPages,
    markDirty,
    reset,
    goToPrevPage,
    goToNextPage,
  };
}
