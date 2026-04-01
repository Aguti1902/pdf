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
import { ChevronDown, Menu, Zap, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const toolsMenu = [
  {
    label: "Edit & Annotate",
    items: [
      { name: "Edit PDF", href: "/edit-pdf" },
      { name: "Sign PDF", href: "/sign-pdf" },
      { name: "Fill PDF Forms", href: "/fill-pdf" },
      { name: "Annotate PDF", href: "/annotate-pdf" },
      { name: "Add Text to PDF", href: "/add-text-pdf" },
      { name: "Highlight PDF", href: "/highlight-pdf" },
      { name: "Draw on PDF", href: "/draw-pdf" },
      { name: "Add Image to PDF", href: "/add-image-pdf" },
    ],
  },
  {
    label: "Organize",
    items: [
      { name: "Merge PDF", href: "/merge-pdf" },
      { name: "Split PDF", href: "/split-pdf" },
      { name: "Compress PDF", href: "/compress-pdf" },
      { name: "Rotate PDF", href: "/rotate-pdf" },
      { name: "Delete Pages", href: "/delete-pages" },
      { name: "Reorder Pages", href: "/reorder-pages" },
    ],
  },
  {
    label: "Convert PDF",
    items: [
      { name: "PDF to Word", href: "/pdf-to-word" },
      { name: "PDF to JPG", href: "/pdf-to-jpg" },
      { name: "PDF to PNG", href: "/pdf-to-png" },
      { name: "Word to PDF", href: "/word-to-pdf" },
      { name: "JPG to PDF", href: "/jpg-to-pdf" },
      { name: "Excel to PDF", href: "/excel-to-pdf" },
      { name: "PPT to PDF", href: "/ppt-to-pdf" },
    ],
  },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <FileText className="h-4 w-4" />
          </div>
          <span className="gradient-text">DocForge</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1">
                All Tools <ChevronDown className="h-3.5 w-3.5 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-[640px] p-4"
              sideOffset={8}
            >
              <div className="grid grid-cols-3 gap-6">
                {toolsMenu.map((group) => (
                  <div key={group.label}>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {group.label}
                    </p>
                    <div className="space-y-0.5">
                      {group.items.map((item) => (
                        <DropdownMenuItem key={item.href} asChild>
                          <Link
                            href={item.href}
                            className="block rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                          >
                            {item.name}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="sm" asChild>
            <Link href="/pricing">Pricing</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/blog">Blog</Link>
          </Button>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
          <Button size="sm" className="gap-1.5" asChild>
            <Link href="/signup">
              <Zap className="h-3.5 w-3.5" />
              Get Started Free
            </Link>
          </Button>
        </div>

        {/* Mobile Menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 overflow-y-auto">
            <div className="mt-6 space-y-6">
              <div className="flex flex-col gap-1">
                <Button variant="ghost" className="justify-start" asChild>
                  <Link href="/pricing" onClick={() => setMobileOpen(false)}>
                    Pricing
                  </Link>
                </Button>
                <Button variant="ghost" className="justify-start" asChild>
                  <Link href="/blog" onClick={() => setMobileOpen(false)}>
                    Blog
                  </Link>
                </Button>
              </div>

              {toolsMenu.map((group) => (
                <div key={group.label}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {group.label}
                  </p>
                  <div className="space-y-0.5">
                    {group.items.map((item) => (
                      <Button
                        key={item.href}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        asChild
                      >
                        <Link
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                        >
                          {item.name}
                        </Link>
                      </Button>
                    ))}
                  </div>
                </div>
              ))}

              <div className="border-t pt-4 space-y-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    Sign In
                  </Link>
                </Button>
                <Button className="w-full" asChild>
                  <Link href="/signup" onClick={() => setMobileOpen(false)}>
                    Get Started Free
                  </Link>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
