"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DownloadGateModals } from "@/components/checkout/DownloadGateModals";
import { useDownloadGate } from "@/hooks/useDownloadGate";
import { Upload, Loader2, Download, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export function PdfToWordProcessor() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<Blob | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [processing, setProcessing] = useState(false);
  const gate = useDownloadGate();

  const onDrop = useCallback(async (accepted: File[]) => {
    const f = accepted[0];
    if (!f) return;
    setFile(f);
    setResult(null);
    // Quick peek at page count
    try {
      const { PDFDocument } = await import("pdf-lib");
      const doc = await PDFDocument.load(await f.arrayBuffer(), { ignoreEncryption: true });
      setPageCount(doc.getPageCount());
    } catch { setPageCount(0); }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  });

  const handleConvert = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const { pdfToWord } = await import("@/lib/pdf-processing/pdfToWord");
      const blob = await pdfToWord(file);
      setResult(blob);
      toast.success("Converted to Word document!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to convert. Make sure the PDF contains readable text.");
    } finally {
      setProcessing(false);
    }
  };

  const outputName = file ? file.name.replace(/\.pdf$/i, ".docx") : "document.docx";

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
          <p className="font-semibold">Drop your PDF here</p>
          <p className="text-sm text-muted-foreground">or click to browse · Text-based PDFs work best</p>
        </div>
      ) : result ? (
        <div className="space-y-3 rounded-xl border bg-card p-4">
          <div className="flex items-center justify-center gap-2 rounded-xl bg-green-50 py-3 text-green-700 dark:bg-green-900/20 dark:text-green-400">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-semibold">Conversion complete!</span>
          </div>
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-800/30 dark:bg-amber-900/20 dark:text-amber-400">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>Text extracted and preserved. Complex layouts (columns, tables, images) are not retained in this conversion.</span>
          </div>
          <Button size="lg" className="w-full gap-2" onClick={() => gate.request(result, outputName)}>
            <Download className="h-4 w-4" /> Download .docx
          </Button>
          <Button variant="outline" size="sm" className="w-full" onClick={() => { setResult(null); setFile(null); }}>
            Convert another file
          </Button>
        </div>
      ) : (
        <div className="space-y-3 rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2">
            <span className="flex-1 truncate text-sm font-medium">{file.name}</span>
            {pageCount > 0 && <Badge variant="secondary">{pageCount} pages</Badge>}
            <Badge variant="secondary">{(file.size / 1024 / 1024).toFixed(1)} MB</Badge>
            <button onClick={() => setFile(null)} className="text-xs text-muted-foreground hover:text-destructive">Change</button>
          </div>
          <p className="text-xs text-muted-foreground">
            Extracts all text content from the PDF and creates an editable .docx file. Scanned PDFs without embedded text are not supported.
          </p>
          <Button size="lg" className="w-full gap-2" onClick={handleConvert} disabled={processing}>
            {processing
              ? <><Loader2 className="h-4 w-4 animate-spin" />Converting…</>
              : <>Convert to Word</>
            }
          </Button>
        </div>
      )}

      <DownloadGateModals gate={gate} toolName="PDF to Word" />
    </div>
  );
}
