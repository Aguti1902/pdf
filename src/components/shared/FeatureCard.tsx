import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  iconColor?: string;
  iconBg?: string;
  className?: string;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  iconColor = "text-primary",
  iconBg = "bg-primary/10",
  className,
}: FeatureCardProps) {
  return (
    <div className={cn("group rounded-xl border bg-card p-6 transition-shadow hover:shadow-md", className)}>
      <div className={cn("mb-4 flex h-11 w-11 items-center justify-center rounded-xl", iconBg)}>
        <Icon className={cn("h-5 w-5", iconColor)} />
      </div>
      <h3 className="mb-2 font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
