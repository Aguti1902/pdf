"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DownloadGateModals } from "@/components/checkout/DownloadGateModals";
import { splitPdfAllPages, splitPdfByPages } from "@/lib/pdf-processing/split";
import { useDownloadGate } from "@/hooks/useDownloadGate";
import { Upload, Loader2, Download, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import JSZip from "jszip";

type Mode = "all" | "range";

export function SplitPdfProcessor() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<Mode>("all");
  const [rangeInput, setRangeInput] = useState("");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const gate = useDownloadGate();

  const onDrop = useCallback((accepted: File[]) => {
    setFile(accepted[0] ?? null);
    setDone(false);
    setResultBlob(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { "application/pdf": [".pdf"] }, multiple: false,
  });

  /** Parse "1-3, 5, 7-10" into 0-based indices */
  const parseRange = (input: string, maxPage: number): number[] => {
    const indices: number[] = [];
    for (const part of input.split(",")) {
      const trimmed = part.trim();
      const match = trimmed.match(/^(\d+)(?:-(\d+))?$/);
      if (!match) continue;
      const start = parseInt(match[1]) - 1;
      const end   = match[2] ? parseInt(match[2]) - 1 : start;
      for (let i = Math.max(0, start); i <= Math.min(maxPage - 1, end); i++) {
        if (!indices.includes(i)) indices.push(i);
      }
    }
    return indices.sort((a, b) => a - b);
  };

  const handleSplit = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      if (mode === "all") {
        const pages = await splitPdfAllPages(file);
        const zip = new JSZip();
        pages.forEach(p => zip.file(p.name, p.blob));
        const zipBlob = await zip.generateAsync({ type: "blob" });
        setResultBlob(zipBlob);
      } else {
        // Range mode — read page count first
        const { PDFDocument } = await import("pdf-lib");
        const doc = await PDFDocument.load(await file.arrayBuffer());
        const indices = parseRange(rangeInput, doc.getPageCount());
        if (indices.length === 0) { toast.error("Invalid page range."); setProcessing(false); return; }
        const res = await splitPdfByPages(file, indices);
        setResultBlob(res.blob);
      }
      setDone(true);
      toast.success("Split complete!");
    } catch { toast.error("Failed to split PDF."); }
    finally { setProcessing(false); }
  };

  const handleDownload = () => {
    if (!resultBlob) return;
    const filename = mode === "all"
      ? `${file?.name.replace(/\.pdf$/i,"")}_pages.zip`
      : `${file?.name.replace(/\.pdf$/i,"")}_range.pdf`;
    gate.request(resultBlob, filename);
  };

  return (
    <div className="mx-auto max-w-lg space-y-4">
      {!file ? (
        <div {...getRootProps()} className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all ${isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
          <input {...getInputProps()} />
          <Upload className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="font-semibold">Drop your PDF here</p>
          <p className="text-sm text-muted-foreground">or click to browse</p>
        </div>
      ) : (
        <div className="space-y-4 rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2">
            <span className="flex-1 truncate text-sm font-medium">{file.name}</span>
            <Badge variant="secondary">{(file.size/1024/1024).toFixed(1)} MB</Badge>
            <button onClick={() => setFile(null)} className="text-xs text-muted-foreground hover:text-destructive">Change</button>
          </div>

          <div className="flex gap-2">
            {(["all","range"] as Mode[]).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${mode===m ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}>
                {m === "all" ? "All pages (ZIP)" : "Page range"}
              </button>
            ))}
          </div>

          {mode === "range" && (
            <div>
              <input
                type="text"
                value={rangeInput}
                onChange={e => setRangeInput(e.target.value)}
                placeholder="e.g. 1-3, 5, 7-10"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <p className="mt-1 text-xs text-muted-foreground">Separate ranges with commas</p>
            </div>
          )}

          {done ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 rounded-xl bg-green-50 py-3 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-semibold">Split complete!</span>
              </div>
              <Button size="lg" className="w-full gap-2" onClick={handleDownload}>
                <Download className="h-4 w-4" /> Download result
              </Button>
              <Button variant="outline" size="sm" className="w-full" onClick={() => { setDone(false); setFile(null); }}>Split another file</Button>
            </div>
          ) : (
            <Button size="lg" className="w-full gap-2" onClick={handleSplit} disabled={processing}>
              {processing ? <><Loader2 className="h-4 w-4 animate-spin" />Splitting…</> : <>Split PDF</>}
            </Button>
          )}
        </div>
      )}

      <DownloadGateModals gate={gate} toolName="Split PDF" />
    </div>
  );
}
