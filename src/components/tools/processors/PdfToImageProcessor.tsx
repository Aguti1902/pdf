"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DownloadGateModals } from "@/components/checkout/DownloadGateModals";
import { pdfToImages, type PageImage, type ImageQuality } from "@/lib/pdf-processing/pdfToImage";
import { useDownloadGate } from "@/hooks/useDownloadGate";
import { Upload, Loader2, Download, CheckCircle2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import JSZip from "jszip";

type Format = "jpeg" | "png";

const QUALITY_LABELS: Record<ImageQuality, string> = {
  low:   "Baja  (~150 DPI)",
  medium: "Media (~250 DPI)",
  high:   "Alta  (~350 DPI)",
  ultra:  "Ultra (~500 DPI)",
};

export function PdfToImageProcessor({ format }: { format: Format }) {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageImage[]>([]);
  const [processing, setProcessing] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const [quality, setQuality] = useState<ImageQuality>("high");
  const gate = useDownloadGate();

  const onDrop = useCallback((accepted: File[]) => {
    setFile(accepted[0] ?? null);
    setPages([]); setPreviews([]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { "application/pdf": [".pdf"] }, multiple: false,
  });

  const handleConvert = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const result = await pdfToImages(file, format, quality);
      setPages(result);
      // Build preview URLs for first 6 pages
      const urls = await Promise.all(
        result.slice(0, 6).map(p => new Promise<string>(res => {
          const reader = new FileReader();
          reader.onload = e => res(e.target?.result as string);
          reader.readAsDataURL(p.blob);
        }))
      );
      setPreviews(urls);
      toast.success(`Converted ${result.length} page${result.length>1?"s":""} to ${format.toUpperCase()}!`);
    } catch { toast.error("Failed to convert PDF to images."); }
    finally { setProcessing(false); }
  };

  const handleDownloadAll = async () => {
    if (pages.length === 0) return;
    if (pages.length === 1) {
      gate.request(pages[0].blob, pages[0].name);
      return;
    }
    // Multiple pages → zip
    const zip = new JSZip();
    pages.forEach(p => zip.file(p.name, p.blob));
    const zipBlob = await zip.generateAsync({ type: "blob" });
    gate.request(zipBlob, `${file?.name.replace(/\.pdf$/i,"")}_images.zip`);
  };

  const handleDownloadSingle = (p: PageImage) => {
    gate.request(p.blob, p.name);
  };

  return (
    <div className="mx-auto max-w-lg space-y-4">
      {!file ? (
        <div {...getRootProps()} className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all ${isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
          <input {...getInputProps()} />
          <Upload className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="font-semibold">Drop your PDF here</p>
          <p className="text-sm text-muted-foreground">or click to browse · Each page → 1 {format.toUpperCase()}</p>
        </div>
      ) : pages.length > 0 ? (
        <div className="space-y-3 rounded-xl border bg-card p-4">
          <div className="flex items-center justify-center gap-2 rounded-xl bg-green-50 py-3 text-green-700 dark:bg-green-900/20 dark:text-green-400">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-semibold">{pages.length} image{pages.length>1?"s":""} ready</span>
          </div>

          {/* Previews */}
          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {previews.map((src, i) => (
                <div key={i} className="relative overflow-hidden rounded-lg border bg-muted aspect-[3/4]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`Page ${i+1}`} className="h-full w-full object-cover" />
                  <button
                    onClick={() => handleDownloadSingle(pages[i])}
                    className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all hover:bg-black/40"
                  >
                    <Download className="h-5 w-5 text-white opacity-0 transition-opacity hover:opacity-100" />
                  </button>
                  <span className="absolute bottom-1 left-1 rounded bg-black/50 px-1 text-[10px] text-white">p.{i+1}</span>
                </div>
              ))}
              {pages.length > 6 && (
                <div className="flex aspect-[3/4] items-center justify-center rounded-lg border bg-muted text-sm text-muted-foreground">
                  +{pages.length - 6} more
                </div>
              )}
            </div>
          )}

          <Button size="lg" className="w-full gap-2" onClick={handleDownloadAll}>
            <Download className="h-4 w-4" />
            {pages.length > 1 ? `Download all ${pages.length} as ZIP` : "Download image"}
          </Button>
          <Button variant="outline" size="sm" className="w-full" onClick={() => { setFile(null); setPages([]); }}>Convert another file</Button>
        </div>
      ) : (
        <div className="space-y-3 rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-primary" />
            <span className="flex-1 truncate text-sm font-medium">{file.name}</span>
            <Badge variant="secondary">{(file.size/1024/1024).toFixed(1)} MB</Badge>
            <button onClick={() => setFile(null)} className="text-xs text-muted-foreground hover:text-destructive">Change</button>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Calidad de imagen</label>
            <select
              value={quality}
              onChange={e => setQuality(e.target.value as ImageQuality)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              {(Object.keys(QUALITY_LABELS) as ImageQuality[]).map(q => (
                <option key={q} value={q}>{QUALITY_LABELS[q]}</option>
              ))}
            </select>
          </div>
          <p className="text-xs text-muted-foreground">Cada página se convierte a una imagen {format.toUpperCase()}. Varias páginas se empaquetan en un ZIP.</p>
          <Button size="lg" className="w-full gap-2" onClick={handleConvert} disabled={processing}>
            {processing ? <><Loader2 className="h-4 w-4 animate-spin" />Converting…</> : <>Convert to {format.toUpperCase()}</>}
          </Button>
        </div>
      )}

      <DownloadGateModals gate={gate} toolName={`PDF to ${format.toUpperCase()}`} />
    </div>
  );
}
