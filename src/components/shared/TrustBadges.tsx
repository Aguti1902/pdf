import { Shield, Zap, Globe, Smartphone, Lock, Clock } from "lucide-react";

const badges = [
  {
    icon: Shield,
    label: "SSL Encrypted",
    desc: "Your files are protected",
  },
  {
    icon: Clock,
    label: "Auto-deleted in 2h",
    desc: "Files never stored long-term",
  },
  {
    icon: Zap,
    label: "Instant Processing",
    desc: "Results in seconds",
  },
  {
    icon: Globe,
    label: "100% Online",
    desc: "No software needed",
  },
  {
    icon: Smartphone,
    label: "Mobile Friendly",
    desc: "Works on any device",
  },
  {
    icon: Lock,
    label: "Private & Secure",
    desc: "We never read your files",
  },
];

export function TrustBadges({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-4">
        {badges.map((b) => (
          <div
            key={b.label}
            className="flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            <b.icon className="h-3.5 w-3.5 text-primary" />
            <span>{b.label}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {badges.map((b) => (
        <div
          key={b.label}
          className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 text-center"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
            <b.icon className="h-4.5 w-4.5 text-primary" />
          </div>
          <div>
            <p className="text-xs font-semibold">{b.label}</p>
            <p className="text-xs text-muted-foreground">{b.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
