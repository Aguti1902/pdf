"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileUploader } from "@/components/tools/FileUploader";
import { ArrowRight, Star, Users, FileCheck } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { UploadedFile } from "@/types";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";

export function Hero() {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const router = useRouter();
  const { t, messages } = useLanguage();
  const hero = messages ? t("hero") : null;
  const nav = messages ? t("nav") : null;

  const handleUpload = (file: UploadedFile) => {
    setUploadedFile(file);
    router.push("/editor?fileId=" + file.id);
  };

  return (
    <section className="relative overflow-hidden py-20 lg:py-28 gradient-hero">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full bg-cyan-400/5 blur-3xl" />
      </div>

      <div className="container relative mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Badge variant="secondary" className="mb-5 gap-1.5 px-3 py-1.5 text-sm">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {hero?.badge ?? "Trusted by 500,000+ users worldwide"}
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="mb-5 text-5xl font-extrabold tracking-tight lg:text-7xl"
          >
            {hero?.title ?? "Edit, Sign & Convert PDFs"}{" "}
            <span className="gradient-text">{hero?.titleHighlight ?? "in seconds"}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground"
          >
            {hero?.subtitle ?? "The all-in-one PDF platform for individuals and teams. Edit, annotate, sign and convert PDFs without installing any software."}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="mx-auto mb-8 max-w-xl"
          >
            <FileUploader
              onUploadComplete={handleUpload}
              label="Drop your PDF here to get started"
              description="or click to browse · No account needed"
              className="shadow-sm"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            <Button size="lg" className="gap-2" asChild>
              <Link href="/pricing">
                {hero?.ctaPrimary ?? "Get Started"} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#tools">{hero?.ctaSecondary ?? "Explore All Tools"}</Link>
            </Button>
          </motion.div>

          {/* Social proof stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span><strong className="text-foreground">500K+</strong> users</span>
            </div>
            <div className="flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-primary" />
              <span><strong className="text-foreground">10M+</strong> files processed</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span><strong className="text-foreground">4.8/5</strong> rating</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
