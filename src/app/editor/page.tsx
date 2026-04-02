import type { Metadata } from "next";
import { EditorLayout } from "@/components/editor/EditorLayout";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "PDF Editor – PDFCraft",
  description: "Edit your PDF document online with PDFCraft's powerful browser-based PDF editor.",
  robots: { index: false, follow: false },
};

export default function EditorPage() {
  return <EditorLayout />;
}
