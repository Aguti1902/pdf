"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SignatureModalProps {
  onConfirm: (dataUrl: string) => void;
  onClose: () => void;
}

const FONTS = [
  { label: "Signature", value: "'Dancing Script', cursive" },
  { label: "Classic",   value: "'Pacifico', cursive" },
  { label: "Formal",    value: "'Satisfy', cursive" },
];

export function SignatureModal({ onConfirm, onClose }: SignatureModalProps) {
  const [tab, setTab] = useState<"draw" | "type">("draw");
  const [typedName, setTypedName] = useState("");
  const [fontIdx, setFontIdx] = useState(0);
  const [color, setColor] = useState("#1e3a5f");
  const [isEmpty, setIsEmpty] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  // Load Google Fonts
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Pacifico&family=Satisfy&display=swap";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
  };

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const src = "touches" in e ? e.touches[0] : e;
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    isDrawing.current = true;
    lastPos.current = getPos(e, canvas);
    setIsEmpty(false);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing.current || !lastPos.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPos.current = pos;
  };

  const stopDraw = () => { isDrawing.current = false; lastPos.current = null; };

  const getSignatureDataUrl = (): string | null => {
    if (tab === "draw") {
      const canvas = canvasRef.current;
      if (!canvas || isEmpty) return null;
      return canvas.toDataURL("image/png");
    } else {
      if (!typedName.trim()) return null;
      // Render typed name to a canvas
      const offscreen = document.createElement("canvas");
      offscreen.width = 400;
      offscreen.height = 120;
      const ctx = offscreen.getContext("2d");
      if (!ctx) return null;
      ctx.clearRect(0, 0, 400, 120);
      ctx.font = `72px ${FONTS[fontIdx].value}`;
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(typedName, 200, 60);
      return offscreen.toDataURL("image/png");
    }
  };

  const handleConfirm = () => {
    const url = getSignatureDataUrl();
    if (!url) return;
    onConfirm(url);
  };

  const canConfirm = tab === "draw" ? !isEmpty : typedName.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border bg-card shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h2 className="font-bold text-base">Create your signature</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Draw or type your signature to place it on the document</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          {(["draw", "type"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={cn("flex-1 py-2.5 text-sm font-medium transition-colors capitalize",
                tab === t ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground")}>
              {t === "draw" ? "✏️ Draw" : "⌨️ Type"}
            </button>
          ))}
        </div>

        <div className="p-5 space-y-4">
          {/* Color picker */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-medium">Color:</span>
            {["#1e3a5f", "#000000", "#1e40af", "#166534", "#7c3aed"].map((c) => (
              <button key={c} onClick={() => setColor(c)}
                className={cn("h-6 w-6 rounded-full border-2 transition-all",
                  color === c ? "scale-125 border-foreground" : "border-transparent")}
                style={{ backgroundColor: c }} />
            ))}
            <input type="color" value={color} onChange={e => setColor(e.target.value)}
              className="h-7 w-7 cursor-pointer rounded border" />
          </div>

          {tab === "draw" ? (
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Sign in the box below</span>
                <button onClick={clearCanvas} className="text-xs text-primary hover:underline">Clear</button>
              </div>
              <canvas
                ref={canvasRef}
                width={460}
                height={150}
                className="w-full rounded-xl border-2 border-dashed border-border bg-white touch-none"
                style={{ cursor: "crosshair" }}
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={stopDraw}
                onMouseLeave={stopDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={stopDraw}
              />
              {isEmpty && (
                <p className="mt-1 text-center text-xs text-muted-foreground/50">Draw your signature here</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <input
                type="text"
                value={typedName}
                onChange={e => setTypedName(e.target.value)}
                placeholder="Type your name..."
                className="w-full rounded-xl border bg-background px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {/* Font options */}
              <div className="grid grid-cols-3 gap-2">
                {FONTS.map((f, i) => (
                  <button key={f.value} onClick={() => setFontIdx(i)}
                    className={cn("rounded-xl border py-3 px-2 text-center transition-all",
                      fontIdx === i ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground")}>
                    <p className="text-xs text-muted-foreground mb-1">{f.label}</p>
                    <p style={{ fontFamily: f.value, color, fontSize: "1.5rem", lineHeight: 1 }}>
                      {typedName || "Signature"}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t px-5 py-3">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" disabled={!canConfirm} onClick={handleConfirm}>
            Place signature →
          </Button>
        </div>
      </div>
    </div>
  );
}
