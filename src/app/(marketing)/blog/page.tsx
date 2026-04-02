import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog – PDFCraft PDF Tips & Guides",
  description: "Learn how to edit, convert, sign, and manage PDFs with PDFCraft's expert guides and tutorials.",
  alternates: { canonical: "/blog" },
};

const posts = [
  {
    slug: "how-to-sign-pdf-online",
    title: "How to Sign a PDF Online in 3 Steps (No Software Needed)",
    excerpt: "Learn the fastest way to add a legally-binding digital signature to any PDF document directly from your browser.",
    tag: "Tutorial",
    date: "Mar 28, 2026",
    readTime: "4 min read",
    featured: true,
  },
  {
    slug: "compress-pdf-without-losing-quality",
    title: "How to Compress a PDF Without Losing Quality",
    excerpt: "File too large to send by email? Here's how to reduce PDF size while keeping your content sharp and readable.",
    tag: "Guide",
    date: "Mar 22, 2026",
    readTime: "5 min read",
    featured: false,
  },
  {
    slug: "pdf-to-word-conversion-tips",
    title: "PDF to Word: Why Formatting Gets Lost (And How to Fix It)",
    excerpt: "Understanding why PDF-to-Word conversions sometimes lose formatting — and best practices for clean results every time.",
    tag: "Tips",
    date: "Mar 15, 2026",
    readTime: "6 min read",
    featured: false,
  },
  {
    slug: "merge-pdf-files-guide",
    title: "The Complete Guide to Merging PDF Files Online",
    excerpt: "From combining two files to organizing multi-document reports — everything you need to know about merging PDFs.",
    tag: "Guide",
    date: "Mar 8, 2026",
    readTime: "5 min read",
    featured: false,
  },
  {
    slug: "annotate-pdf-for-collaboration",
    title: "How to Annotate PDFs for Better Team Collaboration",
    excerpt: "Sticky notes, highlights, stamps and comments — how annotation tools can replace back-and-forth email reviews.",
    tag: "Productivity",
    date: "Mar 1, 2026",
    readTime: "4 min read",
    featured: false,
  },
  {
    slug: "pdf-security-best-practices",
    title: "PDF Security: What You Need to Know Before Uploading",
    excerpt: "Is it safe to upload sensitive PDFs to online tools? Here's exactly what PDFCraft does (and doesn't) store.",
    tag: "Security",
    date: "Feb 22, 2026",
    readTime: "7 min read",
    featured: false,
  },
];

export default function BlogPage() {
  const featured = posts.find((p) => p.featured);
  const rest = posts.filter((p) => !p.featured);

  return (
    <div className="py-16">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="mb-12 text-center">
          <h1 className="mb-3 text-4xl font-extrabold">PDFCraft Blog</h1>
          <p className="text-muted-foreground">
            PDF tips, guides, and tutorials from the PDFCraft team.
          </p>
        </div>

        {/* Featured post */}
        {featured && (
          <Link href={`/blog/${featured.slug}`} className="group mb-10 block">
            <div className="rounded-2xl border bg-card p-8 shadow-sm transition-shadow hover:shadow-md">
              <Badge className="mb-3">{featured.tag}</Badge>
              <h2 className="mb-3 text-2xl font-bold group-hover:text-primary transition-colors">
                {featured.title}
              </h2>
              <p className="mb-4 text-muted-foreground">{featured.excerpt}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>{featured.readTime}</span>
                <span>·</span>
                <span>{featured.date}</span>
                <Button variant="ghost" size="sm" className="ml-auto gap-1 text-primary p-0 h-auto">
                  Read more <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </Link>
        )}

        {/* Post grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
              <div className="flex h-full flex-col rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/30">
                <Badge variant="secondary" className="mb-3 self-start">{post.tag}</Badge>
                <h3 className="mb-2 flex-1 font-semibold leading-snug group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <p className="mb-4 text-xs text-muted-foreground line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{post.readTime}</span>
                  <span>·</span>
                  <span>{post.date}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
