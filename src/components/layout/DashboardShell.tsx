"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FilePlus, FolderOpen, Users, CreditCard,
  Mail, User, LogOut, FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard/new",     icon: FilePlus,    label: "New document" },
  { href: "/dashboard",         icon: FolderOpen,  label: "My documents", exact: true },
  { href: "/dashboard/users",   icon: Users,       label: "Users" },
  { href: "/dashboard/billing", icon: CreditCard,  label: "Billing" },
];

const bottomItems = [
  { href: "/contact",           icon: Mail,        label: "Contact" },
  { href: "/dashboard/profile", icon: User,        label: "My account" },
];

interface DashboardShellProps {
  children: React.ReactNode;
  user?: { name: string | null; email: string; subscriptionStatus?: string };
}

export function DashboardShell({ children, user }: DashboardShellProps) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── Dark Sidebar ── */}
      <aside className="flex w-[168px] shrink-0 flex-col bg-[#111111] text-white">
        {/* Logo */}
        <div className="flex items-center gap-2 px-5 py-5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#2563EB]">
            <FileText className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-sm tracking-tight">PDFCraft</span>
        </div>

        {/* Main nav */}
        <nav className="flex-1 px-2 pt-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] transition-colors mb-0.5",
                isActive(item.href, item.exact)
                  ? "bg-white/10 text-white font-medium"
                  : "text-white/55 hover:bg-white/5 hover:text-white/80"
              )}
            >
              <item.icon className={cn("h-4 w-4 shrink-0",
                isActive(item.href, item.exact) ? "text-white" : "text-white/45"
              )} />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Bottom nav + user */}
        <div className="px-2 pb-5">
          {bottomItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] transition-colors mb-0.5",
                isActive(item.href)
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

          <button className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] text-white/55 transition-colors hover:bg-white/5 hover:text-white/80">
            <LogOut className="h-4 w-4 shrink-0 text-white/45" />
            Log out
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
