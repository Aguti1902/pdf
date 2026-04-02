"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DownloadGateModals } from "@/components/checkout/DownloadGateModals";
import { useDownloadGate } from "@/hooks/useDownloadGate";
import { Upload, Loader2, Download, CheckCircle2, FileText, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export function WordToPdfProcessor() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<Blob | null>(null);
  const [processing, setProcessing] = useState(false);
  const gate = useDownloadGate();

  const onDrop = useCallback((accepted: File[]) => {
    setFile(accepted[0] ?? null);
    setResult(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/msword": [".doc"],
    },
    multiple: false,
  });

  const handleConvert = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const { wordToPdf } = await import("@/lib/pdf-processing/wordToPdf");
      const blob = await wordToPdf(file);
      setResult(blob);
      toast.success("Converted to PDF!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to convert. Make sure the file is a valid .docx document.");
    } finally {
      setProcessing(false);
    }
  };

  const outputName = file ? file.name.replace(/\.docx?$/i, ".pdf") : "document.pdf";

  return (
    <div className="mx-auto max-w-lg space-y-4">
      {!file ? (
        <div
          {...getRootProps()}
          className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all ${
            isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="font-semibold">Drop your Word document here</p>
          <p className="text-sm text-muted-foreground">or click to browse · .docx files supported</p>
        </div>
      ) : result ? (
        <div className="space-y-3 rounded-xl border bg-card p-4">
          <div className="flex items-center justify-center gap-2 rounded-xl bg-green-50 py-3 text-green-700 dark:bg-green-900/20 dark:text-green-400">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-semibold">Conversion complete!</span>
            <Badge variant="secondary">{(result.size / 1024 / 1024).toFixed(2)} MB</Badge>
          </div>
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-800/30 dark:bg-amber-900/20 dark:text-amber-400">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>Text content preserved. Complex formatting (tables, images, columns) may differ from the original.</span>
          </div>
          <Button size="lg" className="w-full gap-2" onClick={() => gate.request(result, outputName)}>
            <Download className="h-4 w-4" /> Download PDF
          </Button>
          <Button variant="outline" size="sm" className="w-full" onClick={() => { setResult(null); setFile(null); }}>
            Convert another file
          </Button>
        </div>
      ) : (
        <div className="space-y-3 rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary shrink-0" />
            <span className="flex-1 truncate text-sm font-medium">{file.name}</span>
            <Badge variant="secondary">{(file.size / 1024 / 1024).toFixed(1)} MB</Badge>
            <button onClick={() => setFile(null)} className="text-xs text-muted-foreground hover:text-destructive">Change</button>
          </div>
          <p className="text-xs text-muted-foreground">
            Converts .docx text, headings, and lists to a clean PDF. Processed entirely in your browser — your file never leaves your device.
          </p>
          <Button size="lg" className="w-full gap-2" onClick={handleConvert} disabled={processing}>
            {processing
              ? <><Loader2 className="h-4 w-4 animate-spin" />Converting…</>
              : <>Convert to PDF</>
            }
          </Button>
        </div>
      )}

      <DownloadGateModals gate={gate} toolName="Word to PDF" />
    </div>
  );
}
