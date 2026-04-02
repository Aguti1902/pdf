"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Upload, FileText, X, CheckCircle2, AlertCircle } from "lucide-react";
import { useUpload } from "@/hooks/useUpload";
import type { UploadedFile } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";

interface FileUploaderProps {
  accept?: Record<string, string[]>;
  maxSize?: number;
  onUploadComplete?: (file: UploadedFile) => void;
  label?: string;
  description?: string;
  className?: string;
}

const DEFAULT_ACCEPT = {
  "application/pdf": [".pdf"],
};

export function FileUploader({
  accept = DEFAULT_ACCEPT,
  maxSize = 100 * 1024 * 1024,
  onUploadComplete,
  label,
  description,
  className,
}: FileUploaderProps) {
  const { state, upload, reset } = useUpload();
  const [dragError, setDragError] = useState<string | null>(null);
  const { t, messages } = useLanguage();
  const hu = messages ? t("heroUpload") : null;
  const resolvedLabel = label ?? hu?.dropLabel ?? "Drop your PDF here to get started";
  const resolvedDesc = description ?? hu?.dropDesc ?? "or click to browse · No account needed";

  const onDrop = useCallback(
    async (accepted: File[], rejected: import("react-dropzone").FileRejection[]) => {
      setDragError(null);
      if (rejected.length > 0) {
        const firstError = rejected[0].errors[0];
        if (firstError.code === "file-too-large") {
          setDragError("File is too large. Maximum size is 100MB.");
        } else if (firstError.code === "file-invalid-type") {
          setDragError("File type not supported.");
        } else {
          setDragError(firstError.message);
        }
        return;
      }
      if (accepted.length > 0) {
        const result = await upload(accepted[0]);
        if (result) onUploadComplete?.(result);
      }
    },
    [upload, onUploadComplete]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
    disabled: state.status === "uploading" || state.status === "ready",
  });

  if (state.status === "ready") {
    return (
      <div className={cn("flex flex-col items-center gap-4 rounded-2xl border-2 border-green-200 bg-green-50 p-8 dark:border-green-800 dark:bg-green-900/20", className)}>
        <CheckCircle2 className="h-10 w-10 text-green-500" />
        <div className="text-center">
          <p className="font-semibold text-green-800 dark:text-green-300">File ready</p>
          <p className="text-sm text-muted-foreground truncate max-w-[200px]">
            {state.file.originalName}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={reset}>
          <X className="mr-1.5 h-3.5 w-3.5" /> Remove
        </Button>
      </div>
    );
  }

  if (state.status === "uploading") {
    return (
      <div className={cn("flex flex-col items-center gap-4 rounded-2xl border-2 border-primary/20 bg-primary/5 p-8", className)}>
        <FileText className="h-10 w-10 text-primary animate-pulse" />
        <div className="w-full max-w-xs">
          <p className="mb-2 text-center text-sm font-medium">Uploading...</p>
          <Progress value={state.progress} className="h-1.5" />
          <p className="mt-1 text-center text-xs text-muted-foreground">{state.progress}%</p>
        </div>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex cursor-pointer flex-col items-center gap-4 rounded-2xl border-2 border-dashed p-10 text-center transition-all",
        isDragActive
          ? "border-primary bg-primary/5 drop-zone-active"
          : "border-border hover:border-primary/50 hover:bg-muted/30",
        state.status === "error" && "border-destructive/50 bg-destructive/5",
        className
      )}
    >
      <input {...getInputProps()} />
      <div className={cn(
        "flex h-14 w-14 items-center justify-center rounded-2xl",
        isDragActive ? "bg-primary/20" : "bg-muted"
      )}>
        <Upload className={cn("h-6 w-6", isDragActive ? "text-primary" : "text-muted-foreground")} />
      </div>

      <div>
        <p className="font-semibold">{isDragActive ? "Drop it here!" : resolvedLabel}</p>
        <p className="mt-1 text-sm text-muted-foreground">{resolvedDesc}</p>
      </div>

      {(state.status === "error" || dragError) && (
        <div className="flex items-center gap-1.5 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {state.status === "error" ? state.message : dragError}
        </div>
      )}

      <Button size="sm" className="mt-1" disabled={isDragActive}>
        {hu?.selectFile ?? "Select File"}
      </Button>

      <p className="text-xs text-muted-foreground">
        🔒 {hu?.encrypted ?? "Your files are encrypted and auto-deleted after 2 hours"}
      </p>
    </div>
  );
}
