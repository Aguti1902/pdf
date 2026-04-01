import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getToolBySlug } from "@/config/tools";
import { ToolPage } from "@/components/tools/ToolPage";



export async function generateMetadata(): Promise<Metadata> {
  const tool = getToolBySlug("merge-pdf");
  if (!tool) notFound();
  return {
    title: tool.metaTitle,
    description: tool.metaDescription,
    alternates: { canonical: `/${tool.slug}` },
  };
}

export default function Page() {
  const tool = getToolBySlug("merge-pdf");
  if (!tool) notFound();
  return <ToolPage tool={tool} />;
}
