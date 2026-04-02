import { DashboardShell } from "@/components/layout/DashboardShell";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Merge, Scissors, Minimize2, FileType2 } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Document – PDFCraft",
  robots: { index: false, follow: false },
};

const mockUser = { name: "Alex Johnson", email: "agutierrezgomez00@gmail.com", subscriptionStatus: "trialing" };

const quickActions = [
  { icon: FileText,  label: "Edit PDF",    desc: "Add text, images and annotations",  href: "/editor",    color: "bg-[#2563EB]/10 text-[#2563EB]" },
  { icon: Upload,    label: "Upload PDF",  desc: "Upload a PDF from your device",      href: "/editor",    color: "bg-blue-50 text-blue-600" },
  { icon: Merge,     label: "Merge PDFs",  desc: "Combine multiple PDFs into one",     href: "/merge-pdf", color: "bg-purple-50 text-purple-600" },
  { icon: Scissors,  label: "Split PDF",   desc: "Split a PDF into separate files",    href: "/split-pdf", color: "bg-orange-50 text-orange-600" },
  { icon: Minimize2, label: "Compress",    desc: "Reduce PDF file size",               href: "/compress-pdf", color: "bg-green-50 text-green-600" },
  { icon: FileType2, label: "Convert",     desc: "PDF to Word, JPG, Excel and more",   href: "/pdf-to-word", color: "bg-yellow-50 text-yellow-600" },
];

export default function NewDocumentPage() {
  return (
    <DashboardShell user={mockUser}>
      <div className="min-h-full">
        <div className="flex items-center justify-between border-b px-8 py-5">
          <h1 className="text-xl font-bold text-neutral-900">New document</h1>
        </div>

        <div className="px-8 py-8 max-w-3xl">
          {/* Upload drop zone */}
          <Link href="/editor"
            className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50 p-12 text-center hover:border-[#2563EB]/50 hover:bg-[#2563EB]/5 transition-all group cursor-pointer">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#2563EB]/10 group-hover:bg-[#2563EB]/20 transition-colors">
              <Upload className="h-7 w-7 text-[#2563EB]" />
            </div>
            <div>
              <p className="text-base font-semibold text-neutral-900">Upload a PDF</p>
              <p className="text-sm text-neutral-500 mt-0.5">Click or drag and drop · Up to 100MB</p>
            </div>
            <Button className="bg-neutral-900 hover:bg-neutral-800 text-white px-6 h-9 text-sm rounded-md">
              Choose file
            </Button>
          </Link>

          {/* Quick actions */}
          <h2 className="mt-8 mb-4 text-sm font-semibold text-neutral-500 uppercase tracking-wider">
            Or start with a tool
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {quickActions.map((a) => (
              <Link key={a.href + a.label} href={a.href}
                className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 hover:border-neutral-300 hover:shadow-sm transition-all">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${a.color}`}>
                  <a.icon className="h-4.5 w-4.5" />
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
