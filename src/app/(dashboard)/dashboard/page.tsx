import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  Download,
  Clock,
  TrendingUp,
  ArrowRight,
  Plus,
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard – DocForge",
  robots: { index: false, follow: false },
};

// Mock data — replace with real DB queries
const mockUser = {
  name: "Alex Johnson",
  email: "alex@example.com",
  subscriptionStatus: "trialing",
};

const recentFiles = [
  { id: "1", name: "Contract_Q1_2026.pdf", tool: "Sign PDF", date: "2 hours ago", size: "245 KB" },
  { id: "2", name: "Invoice_March.pdf", tool: "Compress PDF", date: "Yesterday", size: "1.2 MB → 180 KB" },
  { id: "3", name: "Presentation.pptx", tool: "PPT to PDF", date: "2 days ago", size: "3.8 MB" },
  { id: "4", name: "Report_Annual.pdf", tool: "PDF to Word", date: "3 days ago", size: "512 KB" },
];

export default function DashboardPage() {
  return (
    <DashboardShell user={mockUser}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back, {mockUser.name.split(" ")[0]} 👋
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Here&apos;s what&apos;s happening with your account.
            </p>
          </div>
          <Button className="gap-2" asChild>
            <Link href="/edit-pdf">
              <Plus className="h-4 w-4" /> New Document
            </Link>
          </Button>
        </div>

        {/* Subscription status banner */}
        <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  Trial Active
                </Badge>
                <span className="text-sm font-medium">5 days remaining in trial</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Your trial ends on Apr 8, 2026. After that, you&apos;ll be billed $9.99/month.
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" asChild>
                <Link href="/dashboard/billing">Manage</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/dashboard/billing">Upgrade Now</Link>
              </Button>
            </div>
          </div>
          <Progress value={71} className="mt-3 h-1.5" />
          <p className="text-xs text-muted-foreground mt-1">5 of 7 trial days used</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Files Processed", value: "12", icon: FileText, change: "+3 this week" },
            { label: "Downloads", value: "8", icon: Download, change: "This month" },
            { label: "Storage Used", value: "0 MB", icon: TrendingUp, change: "Auto-deleted" },
            { label: "Days Remaining", value: "5", icon: Clock, change: "Trial period" },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent files */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Files</CardTitle>
            <Button variant="ghost" size="sm" className="gap-1 text-xs" asChild>
              <Link href="/dashboard/history">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {recentFiles.map((file) => (
                <div key={file.id} className="flex items-center gap-4 px-6 py-3 hover:bg-muted/30">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {file.tool} · {file.size}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{file.date}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick tools */}
        <div>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Quick Tools
          </h2>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { name: "Edit PDF", href: "/edit-pdf" },
              { name: "Sign PDF", href: "/sign-pdf" },
              { name: "Merge PDF", href: "/merge-pdf" },
              { name: "Compress PDF", href: "/compress-pdf" },
              { name: "PDF to Word", href: "/pdf-to-word" },
              { name: "Word to PDF", href: "/word-to-pdf" },
            ].map((tool) => (
              <Button key={tool.href} variant="outline" size="sm" className="justify-start" asChild>
                <Link href={tool.href}>{tool.name}</Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
