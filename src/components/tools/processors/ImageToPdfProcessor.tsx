"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PaywallModal } from "@/components/checkout/PaywallModal";
import { imagesToPdf } from "@/lib/pdf-processing/imageToPdf";
import { useSubscriptionDownload } from "@/hooks/useSubscriptionDownload";
import { Upload, X, Loader2, Download, CheckCircle2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface ImageItem { id: string; file: File; preview: string }

export function ImageToPdfProcessor() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [result, setResult] = useState<Blob | null>(null);
  const [processing, setProcessing] = useState(false);
  const { requestDownload, showPaywall, closePaywall } = useSubscriptionDownload();

  const onDrop = useCallback((accepted: File[]) => {
    setResult(null);
    const newItems = accepted.map(f => ({
      id: crypto.randomUUID(),
      file: f,
      preview: URL.createObjectURL(f),
    }));
    setImages(prev => [...prev, ...newItems]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"] },
    multiple: true,
  });

  const remove = (id: string) => {
    setImages(prev => {
      const item = prev.find(i => i.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter(i => i.id !== id);
    });
  };

  const moveUp   = (i: number) => setImages(prev => { const a=[...prev]; if(i>0){[a[i-1],a[i]]=[a[i],a[i-1]];} return a; });
  const moveDown = (i: number) => setImages(prev => { const a=[...prev]; if(i<a.length-1){[a[i],a[i+1]]=[a[i+1],a[i]];} return a; });

  const handleConvert = async () => {
    if (images.length === 0) { toast.error("Add at least one image."); return; }
    setProcessing(true);
    try {
      const blob = await imagesToPdf(images.map(i => i.file));
      setResult(blob);
      toast.success(`Created PDF from ${images.length} image${images.length>1?"s":""}!`);
    } catch { toast.error("Failed to create PDF from images."); }
    finally { setProcessing(false); }
  };

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div {...getRootProps()} className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
        <input {...getInputProps()} />
        <Upload className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
        <p className="font-semibold">Drop JPG / PNG images here</p>
        <p className="text-sm text-muted-foreground">or click to browse · Each image = one PDF page</p>
      </div>

      {images.length > 0 && (
        <div className="space-y-2 rounded-xl border bg-card p-3">
          <div className="grid grid-cols-4 gap-2">
            {images.map((item, index) => (
              <div key={item.id} className="relative overflow-hidden rounded-lg border bg-muted aspect-square group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.preview} alt={item.file.name} className="h-full w-full object-cover" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/0 transition-all group-hover:bg-black/50">
                  <div className="hidden flex-col items-center gap-1 group-hover:flex">
                    <button onClick={() => moveUp(index)}   disabled={index===0}              className="text-white text-xs disabled:opacity-30">↑</button>
                    <button onClick={() => remove(item.id)} className="text-white"><X className="h-4 w-4" /></button>
                    <button onClick={() => moveDown(index)} disabled={index===images.length-1} className="text-white text-xs disabled:opacity-30">↓</button>
                  </div>
                </div>
                <span className="absolute bottom-0.5 left-0.5 rounded bg-black/60 px-1 text-[9px] text-white">{index+1}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground">{images.length} image{images.length>1?"s":""} · hover to reorder</p>
        </div>
      )}

      {result ? (
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 rounded-xl bg-green-50 py-3 text-green-700 dark:bg-green-900/20 dark:text-green-400">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-semibold">PDF created!</span>
            <Badge variant="secondary">{(result.size/1024/1024).toFixed(1)} MB · {images.length} pages</Badge>
          </div>
          <Button size="lg" className="w-full gap-2" onClick={() => requestDownload(result, "images.pdf")}>
            <Download className="h-4 w-4" /> Download PDF
          </Button>
          <Button variant="outline" size="sm" className="w-full" onClick={() => { setResult(null); setImages([]); }}>Convert other images</Button>
        </div>
      ) : (
        <Button size="lg" className="w-full gap-2" onClick={handleConvert} disabled={images.length===0||processing}>
          {processing ? <><Loader2 className="h-4 w-4 animate-spin" />Creating PDF…</> : <><ImageIcon className="h-4 w-4" />Create PDF from {images.length||""} image{images.length!==1?"s":""}</>}
        </Button>
      )}

      <PaywallModal open={showPaywall} onClose={closePaywall} toolName="JPG to PDF" />
    </div>
  );
}
