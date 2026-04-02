"use client";

import { Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLanguage } from "@/contexts/LanguageContext";

const AVATAR_INITIALS = ["SM", "JT", "MG", "AK", "PN", "TR"];
const NAMES = ["Sarah M.", "James T.", "María G.", "Alex K.", "Priya N.", "Tom R."];

export function Testimonials() {
  const { t, messages } = useLanguage();
  const ts = messages ? t("testimonials") : null;

  const testimonials = [
    { key: "t1", roleKey: "t1role", name: NAMES[0], avatar: AVATAR_INITIALS[0] },
    { key: "t2", roleKey: "t2role", name: NAMES[1], avatar: AVATAR_INITIALS[1] },
    { key: "t3", roleKey: "t3role", name: NAMES[2], avatar: AVATAR_INITIALS[2] },
    { key: "t4", roleKey: "t4role", name: NAMES[3], avatar: AVATAR_INITIALS[3] },
    { key: "t5", roleKey: "t5role", name: NAMES[4], avatar: AVATAR_INITIALS[4] },
    { key: "t6", roleKey: "t6role", name: NAMES[5], avatar: AVATAR_INITIALS[5] },
  ];

  return (
    <section className="py-20 border-t">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-extrabold tracking-tight lg:text-4xl">
            {ts?.title ?? "Loved by professionals"}
          </h2>
          <p className="text-muted-foreground">
            {ts?.subtitle ?? "Join hundreds of thousands of users who trust PDFCraft every day."}
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((item) => (
            <div key={item.key} className="flex flex-col gap-4 rounded-xl border bg-card p-6 shadow-sm">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="flex-1 text-sm leading-relaxed">
                &ldquo;{ts?.[item.key as keyof typeof ts] ?? ""}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                    {item.avatar}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {ts?.[item.roleKey as keyof typeof ts] ?? ""}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
