"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Mail, MessageSquare, Clock } from "lucide-react";
import { contactSchema, type ContactInput } from "@/lib/validations";
import { toast } from "sonner";
import { SITE } from "@/config/seo";

export default function ContactPage() {
  const form = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", subject: "", message: "" },
  });

  const onSubmit = async (data: ContactInput) => {
    try {
      await new Promise((r) => setTimeout(r, 800));
      toast.success("Message sent! We'll reply within 24 hours.");
      form.reset();
    } catch {
      toast.error("Failed to send. Please email us directly.");
    }
  };

  return (
    <div className="py-16">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="mb-12 text-center">
          <h1 className="mb-3 text-4xl font-extrabold">Contact Us</h1>
          <p className="text-muted-foreground">
            Have a question or need help? We&apos;re here for you.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Contact info */}
          <div className="space-y-5">
            {[
              { icon: Mail, title: "Email Support", desc: SITE.supportEmail, sub: "We reply within 24 hours" },
              { icon: Clock, title: "Business Hours", desc: "Mon–Fri, 9am–6pm PST", sub: "Premium users get priority" },
              { icon: MessageSquare, title: "Common Topics", desc: "Billing, account, tools", sub: "Check our FAQ first" },
            ].map((item) => (
              <div key={item.title} className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                  <p className="text-xs text-muted-foreground">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl><Input placeholder="Your name" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="subject" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl><Input placeholder="What is your question about?" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="message" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your issue or question in detail..."
                          rows={5}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button type="submit" size="lg" className="w-full">
                    Send Message
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
