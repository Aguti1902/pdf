import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FileText, Download, Search, Clock, Info } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "File History – DocForge Dashboard",
  robots: { index: false, follow: false },
};

const mockUser = { name: "Alex Johnson", email: "alex@example.com", subscriptionStatus: "trialing" };

const mockFiles = [
  { id: "1", name: "Contract_Q1_2026.pdf", tool: "Sign PDF", date: "Apr 1, 2026", size: "245 KB", status: "done" },
  { id: "2", name: "Invoice_March.pdf", tool: "Compress PDF", date: "Mar 31, 2026", size: "180 KB", status: "done" },
  { id: "3", name: "Presentation.pdf", tool: "PPT to PDF", date: "Mar 30, 2026", size: "2.1 MB", status: "done" },
  { id: "4", name: "Report_Annual.docx", tool: "PDF to Word", date: "Mar 29, 2026", size: "512 KB", status: "done" },
  { id: "5", name: "Merger_Agreement.pdf", tool: "Merge PDF", date: "Mar 28, 2026", size: "1.8 MB", status: "done" },
  { id: "6", name: "Budget_2026.xlsx", tool: "Excel to PDF", date: "Mar 27, 2026", size: "340 KB", status: "done" },
];

export default function HistoryPage() {
  return (
    <DashboardShell user={mockUser}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">File History</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your recent processed files. Files are auto-deleted after 2 hours — re-download before they expire.
          </p>
        </div>

        {/* Privacy notice */}
        <div className="flex items-start gap-2 rounded-lg border bg-blue-50 p-3 text-xs text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
          <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <p>
            For your privacy, files uploaded to DocForge are automatically and permanently deleted
            from our servers after 2 hours. The history below shows file names and metadata only.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search files..." className="pl-9" />
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">All Files ({mockFiles.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {mockFiles.map((file) => (
                <div key={file.id} className="flex items-center gap-4 px-6 py-3 hover:bg-muted/20">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{file.tool} · {file.size}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {file.date}
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs dark:bg-green-900/20 dark:text-green-300">
                      {file.status}
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
