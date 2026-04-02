"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PaywallModal } from "@/components/checkout/PaywallModal";
import { mergePdfs } from "@/lib/pdf-processing/merge";
import { useSubscriptionDownload } from "@/hooks/useSubscriptionDownload";
import { Upload, X, FileText, Loader2, Download, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface FileItem { id: string; file: File }

export function MergePdfProcessor() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [result, setResult] = useState<Blob | null>(null);
  const [processing, setProcessing] = useState(false);
  const { requestDownload, showPaywall, closePaywall } = useSubscriptionDownload();

  const onDrop = useCallback((accepted: File[]) => {
    setFiles(prev => [...prev, ...accepted.map(f => ({ id: crypto.randomUUID(), file: f }))]);
    setResult(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { "application/pdf": [".pdf"] }, multiple: true,
  });

  const remove = (id: string) => setFiles(prev => prev.filter(f => f.id !== id));
  const moveUp   = (i: number) => setFiles(prev => { const a=[...prev]; if(i>0){[a[i-1],a[i]]=[a[i],a[i-1]];} return a; });
  const moveDown = (i: number) => setFiles(prev => { const a=[...prev]; if(i<a.length-1){[a[i],a[i+1]]=[a[i+1],a[i]];} return a; });

  const handleMerge = async () => {
    if (files.length < 2) { toast.error("Add at least 2 PDF files."); return; }
    setProcessing(true);
    try {
      const blob = await mergePdfs(files.map(f => f.file));
      setResult(blob);
      toast.success("Merged successfully!");
    } catch { toast.error("Failed to merge PDFs."); }
    finally { setProcessing(false); }
  };

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div {...getRootProps()} className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
        <input {...getInputProps()} />
        <Upload className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
        <p className="font-semibold">Drop PDF files here</p>
        <p className="text-sm text-muted-foreground">or click to browse · Add as many as needed</p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2 rounded-xl border bg-card p-3">
          {files.map((item, index) => (
            <div key={item.id} className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm">
              <FileText className="h-4 w-4 shrink-0 text-primary" />
              <span className="flex-1 truncate">{item.file.name}</span>
              <Badge variant="secondary" className="text-xs shrink-0">{(item.file.size/1024/1024).toFixed(1)} MB</Badge>
              <button onClick={() => moveUp(index)}   disabled={index===0}              className="px-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30">↑</button>
              <button onClick={() => moveDown(index)} disabled={index===files.length-1} className="px-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30">↓</button>
              <button onClick={() => remove(item.id)} className="text-muted-foreground hover:text-destructive"><X className="h-3.5 w-3.5" /></button>
            </div>
          ))}
          <p className="text-center text-xs text-muted-foreground">{files.length} files · merged in order shown</p>
        </div>
      )}

      {result ? (
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 rounded-xl bg-green-50 py-3 text-green-700 dark:bg-green-900/20 dark:text-green-400">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-semibold">Merge complete!</span>
            <Badge variant="secondary">{(result.size/1024/1024).toFixed(1)} MB</Badge>
          </div>
          <Button size="lg" className="w-full gap-2" onClick={() => requestDownload(result, "merged.pdf")}>
            <Download className="h-4 w-4" /> Download merged PDF
          </Button>
          <Button variant="outline" size="sm" className="w-full" onClick={() => setResult(null)}>Merge other files</Button>
        </div>
      ) : (
        <Button size="lg" className="w-full gap-2" onClick={handleMerge} disabled={files.length < 2 || processing}>
          {processing ? <><Loader2 className="h-4 w-4 animate-spin" />Merging…</> : <>Merge {files.length} PDF{files.length!==1?"s":""}</>}
        </Button>
      )}

      <PaywallModal open={showPaywall} onClose={closePaywall} toolName="Merge PDF" />
    </div>
  );
}
