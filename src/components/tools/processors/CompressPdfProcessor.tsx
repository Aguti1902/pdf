"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PaywallModal } from "@/components/checkout/PaywallModal";
import { compressPdf } from "@/lib/pdf-processing/compress";
import { useSubscriptionDownload } from "@/hooks/useSubscriptionDownload";
import { Upload, Loader2, Download, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export function CompressPdfProcessor() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<Blob | null>(null);
  const [processing, setProcessing] = useState(false);
  const { requestDownload, showPaywall, closePaywall } = useSubscriptionDownload();

  const onDrop = useCallback((accepted: File[]) => {
    setFile(accepted[0] ?? null);
    setResult(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { "application/pdf": [".pdf"] }, multiple: false,
  });

  const handleCompress = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const blob = await compressPdf(file);
      setResult(blob);
      const saved = file.size - blob.size;
      const pct = ((saved / file.size) * 100).toFixed(0);
      if (saved > 0) toast.success(`Compressed! Saved ${(saved/1024).toFixed(0)} KB (${pct}%)`);
      else toast.info("File already optimized — no further compression possible.");
    } catch { toast.error("Failed to compress PDF."); }
    finally { setProcessing(false); }
  };

  const savings = result && file ? Math.max(0, file.size - result.size) : 0;

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
        <div className="space-y-3 rounded-xl border bg-card p-4">
          <div className="flex items-center justify-center gap-2 rounded-xl bg-green-50 py-3 text-green-700 dark:bg-green-900/20 dark:text-green-400">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-semibold">Compression complete!</span>
          </div>
          <div className="flex items-center justify-around rounded-lg bg-muted/30 px-4 py-3 text-sm">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Original</p>
              <p className="font-semibold">{(file.size/1024/1024).toFixed(2)} MB</p>
            </div>
            <span className="text-muted-foreground">→</span>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Compressed</p>
              <p className="font-semibold text-green-600">{(result.size/1024/1024).toFixed(2)} MB</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Saved</p>
              <Badge variant="secondary" className="text-green-700">
                {savings > 0 ? `${(savings/1024).toFixed(0)} KB` : "0 KB"}
              </Badge>
            </div>
          </div>
          <Button size="lg" className="w-full gap-2" onClick={() => requestDownload(result, `compressed_${file.name}`)}>
            <Download className="h-4 w-4" /> Download compressed PDF
          </Button>
          <Button variant="outline" size="sm" className="w-full" onClick={() => { setResult(null); setFile(null); }}>Compress another file</Button>
        </div>
      ) : (
        <div className="space-y-3 rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2">
            <span className="flex-1 truncate text-sm font-medium">{file.name}</span>
            <Badge variant="secondary">{(file.size/1024/1024).toFixed(1)} MB</Badge>
            <button onClick={() => setFile(null)} className="text-xs text-muted-foreground hover:text-destructive">Change</button>
          </div>
          <p className="text-xs text-muted-foreground">
            PDFCraft removes redundant data and optimizes the PDF structure. For scanned PDFs with heavy images, consider reducing image resolution separately.
          </p>
          <Button size="lg" className="w-full gap-2" onClick={handleCompress} disabled={processing}>
            {processing ? <><Loader2 className="h-4 w-4 animate-spin" />Compressing…</> : <>Compress PDF</>}
          </Button>
        </div>
      )}

      <PaywallModal open={showPaywall} onClose={closePaywall} toolName="Compress PDF" />
    </div>
  );
}
