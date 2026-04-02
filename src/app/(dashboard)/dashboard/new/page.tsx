"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Merge, Scissors, Minimize2, FileType2 } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

interface UserData { id: string; email: string; name: string | null; }

export default function NewDocumentPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const { t, messages } = useLanguage();
  const d = messages ? t("dashboard") : null;

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.user) setUser(data.user); });
  }, []);

  const quickActions = [
    { icon: FileText,  label: "Edit PDF",   desc: "Add text, images and annotations",  href: "/editor",       color: "bg-[#2563EB]/10 text-[#2563EB]" },
    { icon: Merge,     label: "Merge PDFs", desc: "Combine multiple PDFs into one",    href: "/merge-pdf",    color: "bg-purple-50 text-purple-600" },
    { icon: Scissors,  label: "Split PDF",  desc: "Split a PDF into separate files",   href: "/split-pdf",    color: "bg-orange-50 text-orange-600" },
    { icon: Minimize2, label: "Compress",   desc: "Reduce PDF file size",              href: "/compress-pdf", color: "bg-green-50 text-green-600" },
    { icon: FileType2, label: "Convert",    desc: "PDF to Word, JPG, Excel and more",  href: "/pdf-to-word",  color: "bg-yellow-50 text-yellow-600" },
  ];

  return (
    <DashboardShell user={user ?? undefined}>
      <div className="min-h-full">
        <div className="flex items-center justify-between border-b px-8 py-5">
          <h1 className="text-xl font-bold text-neutral-900">{d?.newDoc ?? "New document"}</h1>
        </div>

        <div className="px-8 py-8 max-w-3xl">
          <Link href="/editor"
            className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50 p-12 text-center hover:border-[#2563EB]/50 hover:bg-[#2563EB]/5 transition-all group cursor-pointer">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#2563EB]/10 group-hover:bg-[#2563EB]/20 transition-colors">
              <Upload className="h-7 w-7 text-[#2563EB]" />
            </div>
            <div>
              <p className="text-base font-semibold text-neutral-900">{d?.uploadPdf ?? "Upload a PDF"}</p>
              <p className="text-sm text-neutral-500 mt-0.5">{d?.uploadDesc ?? "Click or drag and drop · Up to 100MB"}</p>
            </div>
            <Button className="bg-neutral-900 hover:bg-neutral-800 text-white px-6 h-9 text-sm rounded-md">
              {d?.chooseFile ?? "Choose file"}
            </Button>
          </Link>

          <h2 className="mt-8 mb-4 text-sm font-semibold text-neutral-500 uppercase tracking-wider">
            {d?.orStartTool ?? "Or start with a tool"}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {quickActions.map((a) => (
              <Link key={a.label} href={a.href}
                className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 hover:border-neutral-300 hover:shadow-sm transition-all">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${a.color}`}>
                  <a.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-neutral-900">{a.label}</p>
                  <p className="text-xs text-neutral-500 truncate">{a.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
