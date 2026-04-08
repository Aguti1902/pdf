"use client";
// Redirect /dashboard/tools to /dashboard/new (same content)
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export default function ToolsPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/dashboard/new"); }, [router]);
  return null;
}
