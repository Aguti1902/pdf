"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PaywallModal } from "@/components/checkout/PaywallModal";
import { reorderPdfPages } from "@/lib/pdf-processing/reorder";
import { useSubscriptionDownload } from "@/hooks/useSubscriptionDownload";
import { Upload, GripVertical, Loader2, Download, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export function ReorderPagesProcessor() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [order, setOrder] = useState<number[]>([]);
  const [result, setResult] = useState<Blob | null>(null);
  const [processing, setProcessing] = useState(false);
  const { requestDownload, showPaywall, closePaywall } = useSubscriptionDownload();

  const onDrop = useCallback(async (accepted: File[]) => {
    const f = accepted[0];
    if (!f) return;
    setFile(f); setResult(null);
    const { PDFDocument } = await import("pdf-lib");
    const doc = await PDFDocument.load(await f.arrayBuffer());
    const count = doc.getPageCount();
    setPageCount(count);
    setOrder(Array.from({ length: count }, (_, i) => i));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { "application/pdf": [".pdf"] }, multiple: false,
  });

  const moveUp   = (i: number) => setOrder(prev => { const a=[...prev]; if(i>0){[a[i-1],a[i]]=[a[i],a[i-1]];} return a; });
  const moveDown = (i: number) => setOrder(prev => { const a=[...prev]; if(i<a.length-1){[a[i],a[i+1]]=[a[i+1],a[i]];} return a; });

  const handleReorder = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const blob = await reorderPdfPages(file, order);
      setResult(blob);
      toast.success("Pages reordered!");
    } catch { toast.error("Failed to reorder pages."); }
    finally { setProcessing(false); }
  };

  const isOriginalOrder = order.every((v, i) => v === i);

  return (
    <div className="mx-auto max-w-lg space-y-4">
      {!file ? (
        <div {...getRootProps()} className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all ${isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
          <input {...getInputProps()} />
          <Upload className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="font-semibold">Drop your PDF here</p>
          <p className="text-sm text-muted-foreground">or click to browse</p>
        </div>
      ) : result ? (
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 rounded-xl bg-green-50 py-3 text-green-700 dark:bg-green-900/20 dark:text-green-400">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-semibold">Pages reordered!</span>
          </div>
          <Button size="lg" className="w-full gap-2" onClick={() => requestDownload(result, `reordered_${file.name}`)}>
            <Download className="h-4 w-4" /> Download reordered PDF
          </Button>
          <Button variant="outline" size="sm" className="w-full" onClick={() => { setResult(null); setFile(null); }}>Reorder another file</Button>
        </div>
      ) : (
        <div className="space-y-3 rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <span className="flex-1 truncate text-sm font-medium">{file.name}</span>
            <Badge variant="secondary">{pageCount} pages</Badge>
            <button onClick={() => setFile(null)} className="text-xs text-muted-foreground hover:text-destructive">Change</button>
          </div>

          <p className="text-xs text-muted-foreground">Drag pages to reorder, then click Apply.</p>

          <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
            {order.map((pageIdx, pos) => (
              <div key={pageIdx} className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2">
                <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                <span className="flex-1 text-sm">Page {pageIdx + 1}</span>
                <button onClick={() => moveUp(pos)}   disabled={pos===0}          className="px-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30">↑</button>
                <button onClick={() => moveDown(pos)} disabled={pos===order.length-1} className="px-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30">↓</button>
              </div>
            ))}
          </div>

          <Button size="lg" className="w-full gap-2" onClick={handleReorder} disabled={processing || isOriginalOrder}>
            {processing ? <><Loader2 className="h-4 w-4 animate-spin" />Applying…</> : isOriginalOrder ? "Change order above to apply" : "Apply new page order"}
          </Button>
        </div>
      )}

      <PaywallModal open={showPaywall} onClose={closePaywall} toolName="Reorder Pages" />
    </div>
  );
}
