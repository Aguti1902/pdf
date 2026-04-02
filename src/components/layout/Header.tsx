"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  ChevronDown,
  Menu,
  Zap,
  FileText,
  Pencil,
  PenLine,
  ClipboardList,
  MessageSquare,
  ALargeSmall,
  Highlighter,
  Paintbrush,
  ImagePlus,
  Layers,
  Scissors,
  Minimize2,
  RotateCw,
  Trash2,
  ArrowUpDown,
  FileCode,
  FileImage,
  FileJson,
  Table,
  Monitor,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";

const toolsMenuConfig = [
  {
    key: "editAnnotate" as const,
    items: [
      { key: "editPdf", href: "/edit-pdf", icon: Pencil },
      { key: "signPdf", href: "/sign-pdf", icon: PenLine },
      { key: "fillForms", href: "/fill-pdf", icon: ClipboardList },
      { key: "annotate", href: "/annotate-pdf", icon: MessageSquare },
      { key: "addText", href: "/add-text-pdf", icon: ALargeSmall },
      { key: "highlight", href: "/highlight-pdf", icon: Highlighter },
      { key: "draw", href: "/draw-pdf", icon: Paintbrush },
      { key: "addImage", href: "/add-image-pdf", icon: ImagePlus },
    ],
  },
  {
    key: "organize" as const,
    items: [
      { key: "merge", href: "/merge-pdf", icon: Layers },
      { key: "split", href: "/split-pdf", icon: Scissors },
      { key: "compress", href: "/compress-pdf", icon: Minimize2 },
      { key: "rotate", href: "/rotate-pdf", icon: RotateCw },
      { key: "deletePages", href: "/delete-pages", icon: Trash2 },
      { key: "reorder", href: "/reorder-pages", icon: ArrowUpDown },
    ],
  },
  {
    key: "convertPdf" as const,
    items: [
      { key: "pdfToWord", href: "/pdf-to-word", icon: FileCode },
      { key: "pdfToJpg", href: "/pdf-to-jpg", icon: FileImage },
      { key: "pdfToPng", href: "/pdf-to-png", icon: FileJson },
      { key: "wordToPdf", href: "/word-to-pdf", icon: FileCode },
      { key: "jpgToPdf", href: "/jpg-to-pdf", icon: FileImage },
      { key: "excelToPdf", href: "/excel-to-pdf", icon: Table },
      { key: "pptToPdf", href: "/ppt-to-pdf", icon: Monitor },
    ],
  },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t, messages } = useLanguage();
  const nav = messages ? t("nav") : null;
  const tools = messages ? t("tools") : null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <FileText className="h-4 w-4" />
          </div>
          <span className="gradient-text">PDFCraft</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1">
                {nav?.tools ?? "All Tools"}{" "}
                <ChevronDown className="h-3.5 w-3.5 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[680px] p-5" sideOffset={8}>
              <div className="grid grid-cols-3 gap-6">
                {toolsMenuConfig.map((group) => (
                  <div key={group.key}>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {nav?.[group.key] ?? group.key}
                    </p>
                    <div className="space-y-0.5">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        return (
                          <DropdownMenuItem key={item.href} asChild>
                            <Link
                              href={item.href}
                              className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                            >
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                                <Icon className="h-3.5 w-3.5" />
                              </span>
                              <span>{tools?.[item.key as keyof typeof tools] ?? item.key}</span>
                            </Link>
                          </DropdownMenuItem>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="sm" asChild>
            <Link href="/pricing">{nav?.pricing ?? "Pricing"}</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/blog">{nav?.blog ?? "Blog"}</Link>
          </Button>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-1 md:flex">
          <LanguageSwitcher />
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">{nav?.signIn ?? "Sign In"}</Link>
          </Button>
          <Button size="sm" className="gap-1.5" asChild>
            <Link href="/signup">
              <Zap className="h-3.5 w-3.5" />
              {nav?.getStarted ?? "Get Started"}
            </Link>
          </Button>
        </div>

        {/* Mobile Menu */}
        <div className="flex items-center gap-1 md:hidden">
          <LanguageSwitcher compact />
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 overflow-y-auto">
              <div className="mt-6 space-y-6">
                <div className="flex flex-col gap-1">
                  <Button variant="ghost" className="justify-start" asChild>
                    <Link href="/pricing" onClick={() => setMobileOpen(false)}>
                      {nav?.pricing ?? "Pricing"}
                    </Link>
                  </Button>
                  <Button variant="ghost" className="justify-start" asChild>
                    <Link href="/blog" onClick={() => setMobileOpen(false)}>
                      {nav?.blog ?? "Blog"}
                    </Link>
                  </Button>
                </div>

                {toolsMenuConfig.map((group) => (
                  <div key={group.key}>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {nav?.[group.key] ?? group.key}
                    </p>
                    <div className="space-y-0.5">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Button
                            key={item.href}
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start gap-2"
                            asChild
                          >
                            <Link href={item.href} onClick={() => setMobileOpen(false)}>
                              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
                                <Icon className="h-3 w-3" />
                              </span>
                              {tools?.[item.key as keyof typeof tools] ?? item.key}
                            </Link>
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <div className="border-t pt-4 space-y-2">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/login" onClick={() => setMobileOpen(false)}>
                      {nav?.signIn ?? "Sign In"}
                    </Link>
                  </Button>
                  <Button className="w-full" asChild>
                    <Link href="/signup" onClick={() => setMobileOpen(false)}>
                      {nav?.getStarted ?? "Get Started"}
                    </Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
