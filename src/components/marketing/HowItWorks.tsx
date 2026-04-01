import { Upload, Wand2, Download } from "lucide-react";

const steps = [
  {
    icon: Upload,
    number: "01",
    title: "Upload your file",
    description: "Drag and drop or select your PDF (or other file) from your device, Google Drive, or Dropbox. Files are encrypted on upload.",
  },
  {
    icon: Wand2,
    number: "02",
    title: "Edit and customize",
    description: "Use our powerful online tools to edit, annotate, convert, compress, or reorganize your document — right in your browser.",
  },
  {
    icon: Download,
    number: "03",
    title: "Download instantly",
    description: "Your processed file is ready in seconds. Download it or share a link. Files are automatically deleted after 2 hours for privacy.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 bg-muted/30 border-t">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-extrabold tracking-tight lg:text-4xl">
            How it works
          </h2>
          <p className="mx-auto max-w-lg text-muted-foreground">
            Process your PDFs in three simple steps. No account, no software, no waiting.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.number} className="relative flex flex-col items-center text-center">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="absolute left-[calc(50%+48px)] top-10 hidden h-px w-[calc(100%-96px)] bg-border md:block" />
              )}
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
                <step.icon className="h-8 w-8 text-primary-foreground" />
              </div>
              <div className="mb-1 text-xs font-bold uppercase tracking-widest text-primary">
                Step {step.number}
              </div>
              <h3 className="mb-2 text-lg font-bold">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
