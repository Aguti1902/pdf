"use client";

import { useEffect, useRef, useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Button } from "@/components/ui/button";
import {
  Upload, FileEdit, PenLine, ClipboardList, MessageSquare, Type,
  Highlighter, Pencil, Image, Combine, Scissors, Minimize2, RotateCw,
  Trash2, GripVertical, FileText, ImageDown, FilePlus, TableProperties,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";

interface UserData { id: string; email: string; name: string | null; }

const ICON_MAP: Record<string, React.ElementType> = {
  FileEdit, PenLine, ClipboardList, MessageSquare, Type, Highlighter, Pencil,
  Image, Combine, Scissors, Minimize2, RotateCw, Trash2, GripVertical,
  FileText, ImageDown, FilePlus, TableProperties,
};

// Tool hrefs use /{slug} directly (no /tools/ prefix)
const ALL_TOOLS = [
  {
    category: "Editar y anotar",
    color: "bg-blue-50 text-blue-600",
    ring: "hover:border-blue-200",
    tools: [
      { slug: "edit-pdf",      icon: "FileEdit",      label: "Editar PDF",       desc: "Añade texto, imágenes y anotaciones" },
      { slug: "sign-pdf",      icon: "PenLine",       label: "Firmar PDF",       desc: "Crea y coloca tu firma digital" },
      { slug: "annotate-pdf",  icon: "MessageSquare", label: "Anotar PDF",       desc: "Comentarios y notas en el PDF" },
      { slug: "add-text-pdf",  icon: "Type",          label: "Añadir texto",     desc: "Inserta cuadros de texto" },
      { slug: "highlight-pdf", icon: "Highlighter",   label: "Resaltar",         desc: "Resalta texto en el PDF" },
      { slug: "draw-pdf",      icon: "Pencil",        label: "Dibujar",          desc: "Dibujo a mano alzada" },
      { slug: "add-image-pdf", icon: "Image",         label: "Añadir imagen",    desc: "Inserta imágenes en el PDF" },
      { slug: "fill-pdf",      icon: "ClipboardList", label: "Rellenar PDF",     desc: "Rellena formularios PDF" },
    ],
  },
  {
    category: "Organizar páginas",
    color: "bg-purple-50 text-purple-600",
    ring: "hover:border-purple-200",
    tools: [
      { slug: "merge-pdf",     icon: "Combine",      label: "Fusionar PDFs",    desc: "Combina varios PDFs en uno" },
      { slug: "split-pdf",     icon: "Scissors",     label: "Dividir PDF",      desc: "Divide en archivos separados" },
      { slug: "compress-pdf",  icon: "Minimize2",    label: "Comprimir PDF",    desc: "Reduce el tamaño del archivo" },
      { slug: "rotate-pdf",    icon: "RotateCw",     label: "Rotar PDF",        desc: "Rota páginas del PDF" },
      { slug: "reorder-pages", icon: "GripVertical", label: "Reordenar páginas",desc: "Cambia el orden de las páginas" },
      { slug: "delete-pages",  icon: "Trash2",       label: "Eliminar páginas", desc: "Borra páginas del PDF" },
    ],
  },
  {
    category: "Convertir desde PDF",
    color: "bg-orange-50 text-orange-600",
    ring: "hover:border-orange-200",
    tools: [
      { slug: "pdf-to-word",  icon: "FileText",  label: "PDF a Word",  desc: "Convierte PDF a documento Word" },
      { slug: "pdf-to-jpg",   icon: "ImageDown", label: "PDF a JPG",   desc: "Convierte páginas a imágenes JPG" },
      { slug: "pdf-to-png",   icon: "ImageDown", label: "PDF a PNG",   desc: "Convierte páginas a imágenes PNG" },
    ],
  },
  {
    category: "Convertir a PDF",
    color: "bg-green-50 text-green-600",
    ring: "hover:border-green-200",
    tools: [
      { slug: "word-to-pdf",  icon: "FilePlus",        label: "Word a PDF",   desc: "Convierte documentos Word a PDF" },
      { slug: "jpg-to-pdf",   icon: "FilePlus",        label: "JPG a PDF",    desc: "Convierte imágenes JPG a PDF" },
      { slug: "excel-to-pdf", icon: "TableProperties", label: "Excel a PDF",  desc: "Convierte hojas de cálculo a PDF" },
    ],
  },
];

export default function NewDocumentPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [search, setSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { t, messages } = useLanguage();
  const d = messages ? t("dashboard") : null;

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.user) setUser(data.user); });
  }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const id = crypto.randomUUID();
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        sessionStorage.setItem(`pdfcraft_file_${id}`, JSON.stringify({ dataUrl: ev.target?.result, name: file.name, id }));
        router.push(`/editor?fileId=${id}`);
      } catch { router.push("/editor"); }
    };
    reader.readAsDataURL(file);
  };

  const searchLower = search.toLowerCase();
  const filteredCategories = search
    ? ALL_TOOLS.map(cat => ({
        ...cat,
        tools: cat.tools.filter(t =>
          t.label.toLowerCase().includes(searchLower) ||
          t.desc.toLowerCase().includes(searchLower)
        ),
      })).filter(cat => cat.tools.length > 0)
    : ALL_TOOLS;

  return (
    <DashboardShell user={user ?? undefined}>
      <div className="min-h-full">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-8 py-5">
          <h1 className="text-xl font-bold text-neutral-900">{d?.newDoc ?? "Nuevo documento"}</h1>
        </div>

        <div className="px-8 py-6 space-y-8">
          {/* Upload area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50 p-10 text-center hover:border-[#2563EB]/50 hover:bg-[#2563EB]/5 transition-all group cursor-pointer"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#2563EB]/10 group-hover:bg-[#2563EB]/20 transition-colors">
              <Upload className="h-7 w-7 text-[#2563EB]" />
            </div>
            <div>
              <p className="text-base font-semibold text-neutral-900">{d?.uploadPdf ?? "Subir un PDF"}</p>
              <p className="text-sm text-neutral-500 mt-0.5">{d?.uploadDesc ?? "Haz clic o arrastra y suelta · Hasta 100 MB"}</p>
            </div>
            <Button className="bg-neutral-900 hover:bg-neutral-800 text-white px-6 h-9 text-sm rounded-md">
              {d?.chooseFile ?? "Elegir archivo"}
            </Button>
            <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" className="hidden" onChange={handleFile} />
          </div>

          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar herramienta…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-4 py-2 text-sm placeholder:text-neutral-400 focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]/30"
            />
          </div>

          {/* Tool categories */}
          {filteredCategories.map(cat => (
            <section key={cat.category}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-500">
                {cat.category}
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {cat.tools.map(tool => {
                  const Icon = ICON_MAP[tool.icon] ?? FileText;
                  return (
                    <Link
                      key={tool.slug}
                      href={`/${tool.slug}`}
                      className={`relative flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 transition-all hover:shadow-sm ${cat.ring} hover:border`}
                    >
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${cat.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-neutral-900 leading-tight">{tool.label}</p>
                        <p className="text-xs text-neutral-500 truncate mt-0.5">{tool.desc}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
