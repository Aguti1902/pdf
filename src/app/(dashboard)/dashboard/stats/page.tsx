"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { FileText, Download, Zap, TrendingUp, Clock, BarChart3 } from "lucide-react";

interface UserData { id: string; email: string; name: string | null; }
interface DocRow   { id: string; title: string; fileSize: number; updatedAt: string; }

export default function StatsPage() {
  const [user, setUser]   = useState<UserData | null>(null);
  const [docs, setDocs]   = useState<DocRow[]>([]);

  useEffect(() => {
    Promise.all([fetch("/api/auth/me"), fetch("/api/documents")])
      .then(async ([me, d]) => {
        if (me.ok)  setUser((await me.json()).user);
        if (d.ok)   setDocs((await d.json()).documents ?? []);
      });
  }, []);

  const totalSize = docs.reduce((acc, d) => acc + d.fileSize, 0);
  const fmtSize   = (b: number) => b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`;

  const stats = [
    { icon: FileText,  label: "Documentos guardados", value: docs.length.toString(),    sub: "en tu cuenta" },
    { icon: Download,  label: "Almacenamiento usado",  value: fmtSize(totalSize),         sub: "de documentos" },
    { icon: Zap,       label: "Herramientas",           value: "22",                       sub: "disponibles" },
    { icon: TrendingUp,label: "Conversiones",           value: "—",                        sub: "este mes" },
  ];

  const recentDocs = docs.slice(0, 5);

  return (
    <DashboardShell user={user ?? undefined}>
      <div className="min-h-full">
        <div className="flex items-center justify-between border-b px-8 py-5">
          <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" /> Estadísticas
          </h1>
        </div>

        <div className="px-8 py-6 space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-4 gap-4">
            {stats.map(s => (
              <div key={s.label} className="rounded-xl border border-neutral-200 bg-white p-5">
                <div className="flex items-center gap-2 text-neutral-400 mb-3">
                  <s.icon className="h-4 w-4" />
                  <span className="text-xs font-medium">{s.label}</span>
                </div>
                <p className="text-2xl font-bold text-neutral-900">{s.value}</p>
                <p className="text-xs text-neutral-400 mt-1">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Recent activity */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <h2 className="text-sm font-semibold text-neutral-700 mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4" /> Actividad reciente
            </h2>
            {recentDocs.length === 0 ? (
              <p className="text-sm text-neutral-400 text-center py-8">No hay actividad reciente.</p>
            ) : (
              <div className="space-y-3">
                {recentDocs.map(doc => (
                  <div key={doc.id} className="flex items-center gap-3 py-2 border-b border-neutral-50 last:border-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-800 truncate">{doc.title}</p>
                      <p className="text-xs text-neutral-400">{new Date(doc.updatedAt).toLocaleDateString("es-ES")}</p>
                    </div>
                    <span className="text-xs text-neutral-400">{fmtSize(doc.fileSize)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
