import { DashboardShell } from "@/components/layout/DashboardShell";
import { Button } from "@/components/ui/button";
import {
  FileText, Download, Pencil, MoreVertical,
  FolderPlus, Clock, TrendingUp, Zap,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Documents – PDFCraft",
  robots: { index: false, follow: false },
};

const mockUser = {
  name: "Alex Johnson",
  email: "agutierrezgomez00@gmail.com",
  subscriptionStatus: "trialing",
};

const mockDocuments = [
  { id: "1", name: "2653 DENTAL VELA SEGALA SOCIEDAD CIVIL PROFE...", updatedAt: "01-04-2026 22:29", size: "24.4 KB", expiresIn: "10:00" },
  { id: "2", name: "Contract_Q1_2026.pdf",                              updatedAt: "01-04-2026 18:14", size: "245 KB",  expiresIn: "6:22" },
  { id: "3", name: "Invoice_March_2026.pdf",                            updatedAt: "31-03-2026 09:55", size: "1.2 MB",  expiresIn: null },
];

export default function DashboardPage() {
  return (
    <DashboardShell user={mockUser}>
      <div className="min-h-full">
        {/* ── Top bar ── */}
        <div className="flex items-center justify-between border-b px-8 py-5">
          <h1 className="text-xl font-bold text-neutral-900">My documents</h1>
          <Button className="gap-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-md px-4 h-9 text-sm font-medium">
            Create New
          </Button>
        </div>

        <div className="px-8 py-6 space-y-8">

          {/* ── Upgrade banner ── */}
          {mockUser.subscriptionStatus !== "active" && (
            <div className="relative overflow-hidden rounded-xl bg-[#fff1ee] border border-[#ffd5cc] p-5 flex items-center gap-5">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-4 w-4 text-[#e63946]" />
                  <span className="text-xs font-semibold text-[#e63946] uppercase tracking-wide">Trial active</span>
                </div>
                <h2 className="text-base font-bold text-neutral-900 leading-snug">
                  Make the most of your account
                </h2>
                <p className="text-sm text-neutral-600 mt-0.5">
                  Subscribe to edit, save and <span className="font-medium">download your PDFs</span> without restrictions.
                </p>
              </div>
              {/* Decorative icon */}
              <div className="hidden sm:flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-[#e63946]/10">
                <FileText className="h-10 w-10 text-[#e63946]" />
              </div>
              <Button className="shrink-0 bg-neutral-900 hover:bg-neutral-800 text-white rounded-md px-5 h-9 text-sm font-medium">
                Upgrade now
              </Button>
            </div>
          )}

          {/* ── Stats row ── */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: FileText,  label: "Documents",       value: mockDocuments.length.toString() },
              { icon: Download,  label: "Downloads",       value: "8" },
              { icon: Clock,     label: "Trial days left", value: "5" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-neutral-200 bg-white p-4">
                <div className="flex items-center gap-2 text-neutral-500 mb-2">
                  <s.icon className="h-4 w-4" />
                  <span className="text-xs font-medium">{s.label}</span>
                </div>
                <p className="text-2xl font-bold text-neutral-900">{s.value}</p>
              </div>
            ))}
          </div>

          {/* ── Folders ── */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-neutral-700">Folders</h2>
              <button className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 transition-colors">
                <FolderPlus className="h-3.5 w-3.5" />
                New folder
              </button>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white py-10 text-center">
              <FolderPlus className="mx-auto mb-2 h-8 w-8 text-neutral-300" />
              <p className="text-sm text-neutral-400">Here you can manage your folders</p>
              <button className="mt-3 rounded-md bg-neutral-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 transition-colors">
                Create Folder
              </button>
            </div>
          </div>

          {/* ── Documents table ── */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-neutral-700">Documents</h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="rounded-lg border border-neutral-200 bg-neutral-50 pl-3 pr-3 py-1.5 text-xs text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-300 w-44"
                />
              </div>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-[auto_1fr_160px_90px_80px_120px] items-center gap-0 border-b border-neutral-100 px-4 py-2.5">
                <input type="checkbox" className="mr-3 rounded accent-neutral-900" />
                <span className="text-xs font-semibold text-neutral-500">Name</span>
                <span className="text-xs font-semibold text-neutral-500">Updated Date</span>
                <span className="text-xs font-semibold text-neutral-500">Size</span>
                <span className="text-xs font-semibold text-neutral-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Timer
                </span>
                <span />
              </div>

              {/* Rows */}
              {mockDocuments.length === 0 ? (
                <div className="py-16 text-center text-neutral-400 text-sm">
                  No documents yet. Create or upload your first PDF.
                </div>
              ) : (
                mockDocuments.map((doc, idx) => (
                  <div
                    key={doc.id}
                    className={cn(
                      "grid grid-cols-[auto_1fr_160px_90px_80px_120px] items-center gap-0 px-4 py-3 hover:bg-neutral-50 transition-colors",
                      idx < mockDocuments.length - 1 && "border-b border-neutral-100"
                    )}
                  >
                    <input type="checkbox" className="mr-3 rounded accent-neutral-900" />
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-[#e63946]/10">
                        <FileText className="h-3.5 w-3.5 text-[#e63946]" />
                      </div>
                      <span className="truncate text-sm font-medium text-neutral-800">{doc.name}</span>
                    </div>
                    <span className="text-xs text-neutral-500">{doc.updatedAt}</span>
                    <span className="text-xs text-neutral-500">{doc.size}</span>
                    <div>
                      {doc.expiresIn ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600">
                          <Clock className="h-2.5 w-2.5" /> {doc.expiresIn}
                        </span>
                      ) : (
                        <span className="text-xs text-neutral-300">—</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 justify-end">
                      <button className="flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-2.5 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
                        <Pencil className="h-3 w-3" /> Edit
                      </button>
                      <button className="flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-2.5 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
                        <Download className="h-3 w-3" /> Download
                      </button>
                      <button className="flex h-7 w-7 items-center justify-center rounded-md border border-neutral-200 bg-white hover:bg-neutral-50 transition-colors">
                        <MoreVertical className="h-3.5 w-3.5 text-neutral-500" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </DashboardShell>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
