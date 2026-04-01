import type { Metadata } from "next";

export const metadata: Metadata = { title: "Cookie Policy – DocForge" };

export default function CookiesPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-2 text-3xl font-extrabold">Cookie Policy</h1>
      <p className="mb-8 text-sm text-muted-foreground">Last updated: April 1, 2026</p>
      <div className="space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-bold mb-2">What Are Cookies</h2>
          <p className="text-muted-foreground">Cookies are small text files stored on your device when you visit a website. They help us provide a functional and personalized experience.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold mb-2">Cookies We Use</h2>
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-xs">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-2 text-left">Cookie</th>
                  <th className="px-4 py-2 text-left">Purpose</th>
                  <th className="px-4 py-2 text-left">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr><td className="px-4 py-2 font-mono">session</td><td className="px-4 py-2 text-muted-foreground">Authentication session</td><td className="px-4 py-2 text-muted-foreground">Session</td></tr>
                <tr><td className="px-4 py-2 font-mono">_df_prefs</td><td className="px-4 py-2 text-muted-foreground">User preferences (theme, etc.)</td><td className="px-4 py-2 text-muted-foreground">1 year</td></tr>
                <tr><td className="px-4 py-2 font-mono">_ga</td><td className="px-4 py-2 text-muted-foreground">Google Analytics (optional)</td><td className="px-4 py-2 text-muted-foreground">2 years</td></tr>
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h2 className="text-lg font-bold mb-2">Managing Cookies</h2>
          <p className="text-muted-foreground">You can disable non-essential cookies through your browser settings. Essential cookies cannot be disabled as they are required for the Service to function.</p>
        </section>
      </div>
    </div>
  );
}
