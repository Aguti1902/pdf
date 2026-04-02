"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Button } from "@/components/ui/button";
import {
  FileText, Download, Pencil, MoreVertical,
  FolderPlus, Clock, Trash2, Loader2, Zap,
} from "lucide-react";
import Link from "next/link";

interface DocRow {
  id: string; title: string; fileSize: number;
  pageCount: number; updatedAt: string; createdAt: string;
}
interface UserData {
  id: string; email: string; name: string | null;
  subscription?: { status: string; trialEnd: string | null; stripeCurrentPeriodEnd: string };
}

export default function DashboardPage() {
  const [user,    setUser]    = useState<UserData | null>(null);
  const [docs,    setDocs]    = useState<DocRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [meRes, docsRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/documents"),
        ]);
        if (meRes.ok)   setUser((await meRes.json()).user);
        if (docsRes.ok) setDocs((await docsRes.json()).documents ?? []);
      } finally { setLoading(false); }
    })();
  }, []);

  const subStatus = user?.subscription?.status;
  const isPremium = subStatus === "active" || subStatus === "trialing";

  const trialEnd = user?.subscription?.trialEnd
    ? new Date(user.subscription.trialEnd)
    : null;
  const daysLeft = trialEnd
    ? Math.max(0, Math.ceil((trialEnd.getTime() - Date.now()) / 86400000))
    : null;

  const filtered = docs.filter(d => d.title.toLowerCase().includes(search.toLowerCase()));

  const fmt = (iso: string) => new Date(iso).toLocaleDateString("es-ES", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  }).replace(",", "");

  const fmtSize = (bytes: number) => bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(1)} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

  const deleteDoc = async (id: string) => {
    await fetch(`/api/documents?id=${id}`, { method: "DELETE" });
    setDocs(prev => prev.filter(d => d.id !== id));
  };

  return (
    <DashboardShell user={user ?? undefined}>
      <div className="min-h-full">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b px-8 py-5">
          <h1 className="text-xl font-bold text-neutral-900">My documents</h1>
          <Link href="/editor">
            <Button className="gap-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-md px-4 h-9 text-sm font-medium">
              Create New
            </Button>
          </Link>
        </div>

        <div className="px-8 py-6 space-y-7">

          {/* Upgrade banner */}
          {!isPremium && (
            <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-primary/5 p-5 flex items-center gap-5">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                    {subStatus === "trialing" ? `Trial · ${daysLeft ?? "?"} days left` : "No active plan"}
                  </span>
                </div>
                <h2 className="text-base font-bold text-neutral-900 leading-snug">
                  Make the most of your account
                </h2>
                <p className="text-sm text-neutral-600 mt-0.5">
                  Subscribe to edit, save and <span className="font-medium">download your PDFs</span> without restrictions.
                </p>
              </div>
              <div className="hidden sm:flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <Link href="/checkout">
                <Button className="shrink-0 bg-primary hover:bg-primary/90 text-white rounded-md px-5 h-9 text-sm font-medium">
                  Upgrade now
                </Button>
              </Link>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: FileText, label: "Documents",       value: docs.length.toString() },
              { icon: Clock,    label: subStatus === "trialing" ? "Trial days left" : "Status",
                value: subStatus === "trialing" ? (daysLeft?.toString() ?? "—") : (subStatus ?? "Free") },
              { icon: Download, label: "Plan",
                value: isPremium ? "Premium" : "Free" },
            ].map(s => (
              <div key={s.label} className="rounded-xl border border-neutral-200 bg-white p-4">
                <div className="flex items-center gap-2 text-neutral-500 mb-2">
                  <s.icon className="h-4 w-4" />
                  <span className="text-xs font-medium">{s.label}</span>
                </div>
                <p className="text-2xl font-bold text-neutral-900 capitalize">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Folders */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-neutral-700">Folders</h2>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white py-8 text-center">
              <FolderPlus className="mx-auto mb-2 h-7 w-7 text-neutral-300" />
              <p className="text-sm text-neutral-400">Here you can manage your folders</p>
              <button className="mt-3 rounded-md bg-neutral-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 transition-colors">
                Create Folder
              </button>
            </div>
          </div>

          {/* Documents table */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-neutral-700">Documents</h2>
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="rounded-lg border border-neutral-200 bg-neutral-50 pl-3 pr-3 py-1.5 text-xs text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-primary w-44"
              />
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-[auto_1fr_170px_90px_140px] items-center border-b border-neutral-100 px-4 py-2.5 gap-2">
                <input type="checkbox" className="mr-2 rounded accent-neutral-900" />
                <span className="text-xs font-semibold text-neutral-500">Name</span>
                <span className="text-xs font-semibold text-neutral-500">Updated</span>
                <span className="text-xs font-semibold text-neutral-500">Size</span>
                <span />
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-14 text-neutral-400">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading...
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-14 text-center text-neutral-400 text-sm">
                  {search ? "No results found." : (
                    <div>
                      <FileText className="mx-auto mb-2 h-8 w-8 opacity-20" />
                      <p>No documents yet.</p>
                      <Link href="/editor" className="text-primary text-xs underline mt-1 inline-block">
                        Open editor to create your first PDF
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                filtered.map((doc, idx) => (
                  <div key={doc.id}
                    className={`grid grid-cols-[auto_1fr_170px_90px_140px] items-center px-4 py-3 gap-2 hover:bg-neutral-50 transition-colors ${idx < filtered.length - 1 ? "border-b border-neutral-100" : ""}`}>
                    <input type="checkbox" className="mr-2 rounded accent-neutral-900" />
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-primary/10">
                        <FileText className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <span className="truncate text-sm font-medium text-neutral-800">{doc.title}</span>
                    </div>
                    <span className="text-xs text-neutral-500">{fmt(doc.updatedAt)}</span>
                    <span className="text-xs text-neutral-500">{fmtSize(doc.fileSize)}</span>
                    <div className="flex items-center gap-1 justify-end">
                      <Link href={`/editor?docId=${doc.id}`}>
                        <button className="flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-2.5 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
                          <Pencil className="h-3 w-3" /> Edit
                        </button>
                      </Link>
                      <button
                        onClick={() => !isPremium ? window.location.href = "/checkout" : undefined}
                        className="flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-2.5 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
                        <Download className="h-3 w-3" /> Download
                      </button>
                      <button onClick={() => deleteDoc(doc.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-neutral-200 bg-white hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
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
