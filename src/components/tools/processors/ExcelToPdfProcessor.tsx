"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DownloadGateModals } from "@/components/checkout/DownloadGateModals";
import { useDownloadGate } from "@/hooks/useDownloadGate";
import { Upload, Loader2, Download, CheckCircle2, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

export function ExcelToPdfProcessor() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<Blob | null>(null);
  const [sheetCount, setSheetCount] = useState(0);
  const [processing, setProcessing] = useState(false);
  const gate = useDownloadGate();

  const onDrop = useCallback(async (accepted: File[]) => {
    const f = accepted[0];
    if (!f) return;
    setFile(f);
    setResult(null);
    // Quick peek at sheet count
    try {
      const XLSX = await import("xlsx");
      const buf = await f.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      setSheetCount(wb.SheetNames.length);
    } catch { setSheetCount(1); }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
    multiple: false,
  });

  const handleConvert = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const { excelToPdf } = await import("@/lib/pdf-processing/excelToPdf");
      const blob = await excelToPdf(file);
      setResult(blob);
      toast.success("Converted to PDF!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to convert. Make sure the file is a valid Excel spreadsheet.");
    } finally {
      setProcessing(false);
    }
  };

  const outputName = file ? file.name.replace(/\.xlsx?$/i, ".pdf") : "spreadsheet.pdf";

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
          <p className="font-semibold">Drop your Excel spreadsheet here</p>
          <p className="text-sm text-muted-foreground">or click to browse · .xlsx and .xls supported</p>
        </div>
      ) : result ? (
        <div className="space-y-3 rounded-xl border bg-card p-4">
          <div className="flex items-center justify-center gap-2 rounded-xl bg-green-50 py-3 text-green-700 dark:bg-green-900/20 dark:text-green-400">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-semibold">Conversion complete!</span>
            <Badge variant="secondary">{(result.size / 1024 / 1024).toFixed(2)} MB</Badge>
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
            <FileSpreadsheet className="h-4 w-4 text-green-600 shrink-0" />
            <span className="flex-1 truncate text-sm font-medium">{file.name}</span>
            <Badge variant="secondary">{(file.size / 1024 / 1024).toFixed(1)} MB</Badge>
            <button onClick={() => setFile(null)} className="text-xs text-muted-foreground hover:text-destructive">Change</button>
          </div>
          {sheetCount > 0 && (
            <p className="text-xs text-muted-foreground">
              {sheetCount} sheet{sheetCount > 1 ? "s" : ""} detected · Each sheet becomes a table in the PDF (landscape A4).
            </p>
          )}
          <Button size="lg" className="w-full gap-2" onClick={handleConvert} disabled={processing}>
            {processing
              ? <><Loader2 className="h-4 w-4 animate-spin" />Converting…</>
              : <>Convert to PDF</>
            }
          </Button>
        </div>
      )}

      <DownloadGateModals gate={gate} toolName="Excel to PDF" />
    </div>
  );
}
