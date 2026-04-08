"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FilePlus, FolderOpen, CreditCard,
  Mail, User, LogOut, FileText, Wrench, Clock, BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";

interface DashboardShellProps {
  children: React.ReactNode;
  user?: { name: string | null; email: string; subscriptionStatus?: string };
}

export function DashboardShell({ children, user }: DashboardShellProps) {
  const pathname = usePathname();
  const router   = useRouter();
  const { t, messages } = useLanguage();
  const d = messages ? t("dashboard") : null;
  const nav = d?.nav as Record<string, string> | undefined;

  const [loggingOut, setLoggingOut] = useState(false);

  const navItems = [
    { href: "/dashboard/new",     icon: FilePlus,   label: nav?.newDocument ?? "Nuevo documento" },
    { href: "/dashboard",         icon: FolderOpen, label: nav?.myDocuments ?? "Mis documentos", exact: true },
    { href: "/dashboard/tools",   icon: Wrench,     label: nav?.tools       ?? "Herramientas" },
    { href: "/dashboard/history", icon: Clock,      label: nav?.history     ?? "Historial" },
    { href: "/dashboard/stats",   icon: BarChart3,  label: nav?.stats       ?? "Estadísticas" },
    { href: "/dashboard/billing", icon: CreditCard, label: nav?.billing     ?? "Facturación" },
  ];

  const bottomItems = [
    { href: "/contact",           icon: Mail, label: nav?.contact   ?? "Contacto" },
    { href: "/dashboard/profile", icon: User, label: nav?.myAccount ?? "Mi cuenta" },
  ];

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href) && pathname !== "/dashboard";

  // Special case: /dashboard exact match
  const isActiveItem = (item: typeof navItems[0]) =>
    item.exact
      ? pathname === item.href
      : pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/dashboard");

  const handleLogout = async () => {
    setLoggingOut(true);
    try { await fetch("/api/auth/logout", { method: "POST" }); } catch { /* ignore */ }
    router.push("/");
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── Dark Sidebar ── */}
      <aside className="flex w-[190px] shrink-0 flex-col bg-[#111111] text-white">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 px-5 py-5 hover:opacity-80 transition-opacity">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#2563EB]">
            <FileText className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-sm tracking-tight">PDFCraft</span>
        </Link>

        {/* Main nav */}
        <nav className="flex-1 px-2 pt-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] transition-colors mb-0.5",
                isActiveItem(item)
                  ? "bg-white/10 text-white font-medium"
                  : "text-white/55 hover:bg-white/5 hover:text-white/80"
              )}
            >
              <item.icon className={cn("h-4 w-4 shrink-0",
                isActiveItem(item) ? "text-white" : "text-white/45"
              )} />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Bottom nav + user */}
        <div className="px-2 pb-5 border-t border-white/10 pt-3">
          {bottomItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] transition-colors mb-0.5",
                pathname.startsWith(item.href)
                  ? "bg-white/10 text-white font-medium"
                  : "text-white/55 hover:bg-white/5 hover:text-white/80"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0 text-white/45" />
              {item.label}
            </Link>
          ))}

          {user?.email && (
            <p className="mt-3 truncate px-3 text-[11px] text-white/35">{user.email}</p>
          )}

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] text-white/55 transition-colors hover:bg-white/5 hover:text-white/80 disabled:opacity-40"
          >
            <LogOut className="h-4 w-4 shrink-0 text-white/45" />
            {loggingOut ? "..." : (nav?.logout ?? "Cerrar sesión")}
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto bg-white dark:bg-neutral-50">
        {children}
      </main>
    </div>
  );
}
