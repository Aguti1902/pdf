import { Button } from "@/components/ui/button";
import { ArrowRight, Shield } from "lucide-react";
import Link from "next/link";

export function CtaSection() {
  return (
    <section className="py-20 border-t">
      <div className="container mx-auto max-w-3xl px-4 text-center">
        <div className="rounded-3xl gradient-primary p-12 text-white shadow-xl shadow-primary/20">
          <h2 className="mb-4 text-3xl font-extrabold tracking-tight lg:text-4xl">
            Start working with PDFs today
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-lg opacity-90">
            No software to install. No account required to try. Upgrade in seconds when you're ready.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="gap-2 text-primary font-bold"
              asChild
            >
              <Link href="/signup">
                Get Started Free <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 hover:text-white"
              asChild
            >
              <Link href="/pricing">See Pricing</Link>
            </Button>
          </div>
          <div className="mt-6 flex items-center justify-center gap-1.5 text-sm opacity-75">
            <Shield className="h-4 w-4" />
            <span>7-day trial for $0.99 · Then $9.99/month · Cancel anytime</span>
          </div>
        </div>
      </div>
    </section>
  );
}
