import { Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Sarah M.",
    role: "Freelance Designer",
    avatar: "SM",
    rating: 5,
    text: "I use DocForge every single day for client contracts. The sign and fill tools are incredibly intuitive — faster than any desktop app I've tried.",
  },
  {
    name: "James T.",
    role: "Operations Manager",
    avatar: "JT",
    rating: 5,
    text: "We switched our entire team to DocForge for PDF processing. The batch convert feature alone saves us hours each week. The pricing is very fair.",
  },
  {
    name: "María G.",
    role: "University Student",
    avatar: "MG",
    rating: 5,
    text: "The free tier is genuinely useful for my studies. When I needed more features, the trial was only $0.99. Absolutely worth it.",
  },
  {
    name: "Alex K.",
    role: "Real Estate Agent",
    avatar: "AK",
    rating: 5,
    text: "I need to sign and merge contracts constantly. DocForge makes it effortless — works perfectly on my phone between showings.",
  },
  {
    name: "Priya N.",
    role: "Legal Assistant",
    avatar: "PN",
    rating: 5,
    text: "The PDF to Word conversion is the most accurate I've found online. It handles complex legal formatting without issues.",
  },
  {
    name: "Tom R.",
    role: "Small Business Owner",
    avatar: "TR",
    rating: 5,
    text: "Needed to compress large invoices before emailing. DocForge reduced a 15MB file to 1.2MB with no visible quality loss. Impressive.",
  },
];

export function Testimonials() {
  return (
    <section className="py-20 border-t">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-extrabold tracking-tight lg:text-4xl">
            Loved by professionals
          </h2>
          <p className="text-muted-foreground">
            Join hundreds of thousands of users who trust DocForge every day.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="flex flex-col gap-4 rounded-xl border bg-card p-6 shadow-sm">
              <div className="flex">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="flex-1 text-sm leading-relaxed">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                    {t.avatar}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
