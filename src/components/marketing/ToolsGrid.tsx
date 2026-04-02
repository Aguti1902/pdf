"use client";

import Link from "next/link";
import { tools, toolsByCategory } from "@/config/tools";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as Icons from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

function ToolCard({ tool }: { tool: (typeof tools)[0] }) {
  const IconComponent = (Icons as unknown as Record<string, Icons.LucideIcon>)[tool.icon] ?? Icons.FileText;

  return (
    <Link
      href={`/${tool.slug}`}
      className="tool-card group flex items-center gap-3 rounded-xl border bg-card p-4 hover:border-primary/40 hover:shadow-md transition-all"
    >
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: tool.bgColor }}
      >
        <IconComponent className="h-5 w-5" style={{ color: tool.color }} />
      </div>
      <div className="min-w-0">
        <p className="truncate font-semibold text-sm group-hover:text-primary transition-colors">
          {tool.name}
        </p>
        <p className="truncate text-xs text-muted-foreground">{tool.description}</p>
      </div>
    </Link>
  );
}

export function ToolsGrid() {
  const { t, messages } = useLanguage();
  const tg = messages ? t("toolsGrid") : null;

  const CATEGORY_LABELS: Record<string, string> = {
    all: tg?.allTools ?? "All Tools",
    edit: tg?.editSign ?? "Edit & Sign",
    organize: tg?.organize ?? "Organize",
    "convert-from": tg?.pdfTo ?? "PDF to ...",
    "convert-to": tg?.toPdf ?? "... to PDF",
  };

  return (
    <section id="tools" className="py-20 border-t">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-extrabold tracking-tight lg:text-4xl">
            {tg?.title ?? "Everything you need for PDFs"}
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground">
            {tg?.subtitle ?? "21 professional PDF tools in one place. No software required."}
          </p>
        </div>

        <Tabs defaultValue="all">
          <TabsList className="mb-8 flex h-auto flex-wrap justify-center gap-1 bg-transparent p-0">
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <TabsTrigger
                key={key}
                value={key}
                className="rounded-full border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary"
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {tools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </TabsContent>

          {(["edit", "organize", "convert-from", "convert-to"] as const).map((cat) => (
            <TabsContent key={cat} value={cat}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {toolsByCategory[cat].map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
