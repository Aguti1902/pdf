"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Clock,
  CreditCard,
  Settings,
  User,
  FileText,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/dashboard/history", icon: Clock, label: "File History" },
  { href: "/dashboard/billing", icon: CreditCard, label: "Billing" },
  { href: "/dashboard/profile", icon: User, label: "Profile" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

interface DashboardShellProps {
  children: React.ReactNode;
  user?: { name: string | null; email: string; subscriptionStatus?: string };
}

export function DashboardShell({ children, user }: DashboardShellProps) {
  const pathname = usePathname();
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "U";

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-card lg:flex">
        {/* User info */}
        <div className="p-5 border-b">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user?.name ?? "My Account"}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          {user?.subscriptionStatus && (
            <div className="mt-3">
              {user.subscriptionStatus === "active" || user.subscriptionStatus === "trialing" ? (
                <Badge className="w-full justify-center bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300">
                  ✓ Premium Active
                </Badge>
              ) : (
                <Button size="sm" className="w-full h-7 text-xs" asChild>
                  <Link href="/checkout">Upgrade to Premium</Link>
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
                {isActive && <ChevronRight className="ml-auto h-3.5 w-3.5" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t space-y-1">
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground" asChild>
            <Link href="/edit-pdf">
              <FileText className="h-4 w-4" />
              Open Editor
            </Link>
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-muted/10 p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
