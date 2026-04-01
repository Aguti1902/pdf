# DocForge — Professional PDF SaaS Platform

> Edit, sign, convert and manage PDFs online. Built with Next.js 16, TypeScript, Tailwind CSS, Prisma, and Stripe.

---

## 🚀 Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in all required values (see sections below).

### 3. Set up the database

```bash
npm run db:generate     # Generate Prisma client
npm run db:push         # Push schema to your database (dev)
npm run db:seed         # Seed with demo data
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/              # Login, Signup
│   ├── (dashboard)/         # User dashboard (private)
│   ├── (marketing)/         # Public pages (home, pricing, blog...)
│   ├── (tools)/             # 21 PDF tool pages (SEO landing pages)
│   ├── editor/              # PDF editor interface
│   ├── checkout/            # Checkout page
│   └── api/
│       ├── stripe/          # Stripe checkout, portal, webhook
│       ├── upload/          # File upload endpoint
│       └── subscription/    # Subscription status endpoint
├── components/
│   ├── layout/              # Header, Footer, DashboardShell
│   ├── marketing/           # Hero, ToolsGrid, Testimonials...
│   ├── tools/               # FileUploader, ToolPage
│   ├── editor/              # EditorLayout, toolbar, canvas
│   ├── checkout/            # CheckoutForm, PaywallModal
│   ├── dashboard/           # Dashboard-specific components
│   └── shared/              # PricingCard, FeatureCard, FaqAccordion...
├── config/
│   ├── tools.ts             # All 21 tool definitions + metadata
│   ├── pricing.ts           # Trial/monthly/yearly pricing config
│   └── seo.ts               # Site config, brand, default metadata
├── hooks/
│   ├── useUpload.ts         # File upload with XHR progress
│   ├── useSubscription.ts   # Subscription state management
│   └── usePdfEditor.ts      # Editor state management
├── lib/
│   ├── prisma.ts            # Prisma client singleton
│   ├── stripe.ts            # Stripe helpers
│   └── validations.ts       # Zod schemas
└── types/
    └── index.ts             # Shared TypeScript types
prisma/
├── schema.prisma            # Full database schema
└── seed.ts                  # Demo data seed
```

---

## 🛠 Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui + Radix UI |
| Database | PostgreSQL + Prisma ORM |
| Payments | Stripe (subscriptions + webhooks) |
| Storage | AWS S3 / Supabase Storage (configurable) |
| Auth | Custom (Clerk-ready) |
| Forms | React Hook Form + Zod |
| Animations | Framer Motion |
| Notifications | Sonner |

---

## 💳 Stripe Setup

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Create a **Product** called "DocForge Premium"
3. Create two **Prices**:
   - Trial: $0.99 (one-time) — note the Price ID
   - Monthly: $9.99/month recurring — note the Price ID
4. Add Price IDs to `.env.local`
5. Set up **Webhook**:
   - Endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_*`
   - Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### Test locally with Stripe CLI
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

## 🗄 Database

### Schema includes:
- `users` — accounts, Stripe customer ID
- `subscriptions` — Stripe subscription data + status
- `files` — uploaded file metadata (auto-expires in 2h)
- `edit_sessions` — editor state persistence
- `conversions` — processing job tracking
- `payments` — payment records
- `stripe_events` — webhook idempotency log
- `coupons` — discount codes
- `support_tickets` — contact form submissions
- `audit_logs` — security audit trail
- `blog_posts` — CMS blog content

### Migrations
```bash
npm run db:migrate    # Create and run a new migration
npm run db:studio     # Open Prisma Studio
```

---

## 🔧 PDF Processing (TODO)

The architecture is fully wired up for PDF processing. To enable real processing, connect the following libraries in the `/api` routes:

| Feature | Recommended Library |
|---|---|
| Edit / annotate | [pdf-lib](https://pdf-lib.js.org/) |
| Render / display | [PDF.js](https://mozilla.github.io/pdf.js/) |
| Compress | [Ghostscript](https://www.ghostscript.com/) (via server) or [pdf-lib](https://pdf-lib.js.org/) |
| Convert to image | [pdf2pic](https://github.com/yakovmeister/pdf2pic) |
| Word/Excel to PDF | [LibreOffice](https://www.libreoffice.org/) (headless) or [docx-pdf](https://www.npmjs.com/package/docx-pdf) |
| OCR | [Tesseract.js](https://tesseract.projectnaptha.com/) |
| Signatures | [pdf-lib](https://pdf-lib.js.org/) + canvas |

---

## 📋 TODOs — Connect Real PDF Engine

- [ ] `src/app/api/upload/route.ts` — Replace mock with real S3/Supabase upload
- [ ] `src/app/api/process/route.ts` — Create processing endpoint per tool
- [ ] `src/components/editor/EditorLayout.tsx` — Replace placeholder canvas with PDF.js
- [ ] `src/app/api/stripe/webhook/route.ts` — Map `stripeCustomerId` to real users
- [ ] `src/app/api/stripe/create-checkout/route.ts` — Connect to auth session
- [ ] `src/app/api/stripe/create-portal/route.ts` — Connect to auth session
- [ ] `src/app/api/subscription/route.ts` — Fetch from real DB
- [ ] Add real auth (Clerk or custom JWT sessions)
- [ ] Add email sending (trial reminder, receipt, cancellation confirmation)
- [ ] Add rate limiting (Redis or Upstash)
- [ ] Connect dashboard to real data queries
- [ ] Add error monitoring (Sentry)
- [ ] Add analytics events (see below)

---

## 📊 Analytics Events (Funnel Tracking)

Track these events for CRO optimization:

```javascript
// Key conversion events to track with GA4 / Plausible / Mixpanel:
track("file_uploaded", { tool, fileSize, mimeType });
track("tool_used", { tool, action });
track("paywall_shown", { tool, source });
track("checkout_started", { plan, source });
track("checkout_completed", { plan, amount });
track("trial_started");
track("subscription_activated");
track("subscription_cancelled", { daysUsed });
track("download_attempted_free");
track("download_completed_premium");
```

---

## 🎯 SEO & CRO Optimization Points

**SEO:**
- 21 individual tool landing pages with unique metadata
- Dynamic sitemap at `/sitemap.xml`
- Structured robots.txt
- Open Graph tags on all pages
- Internal linking between related tools

**CRO:**
- Paywall appears only at the download moment (maximum intent)
- Trial disclosed clearly at 3 touchpoints: paywall modal, checkout page, order summary
- Subscription terms visible before checkbox
- Renewal date always shown in billing dashboard
- Easy 1-click cancellation prevents chargebacks

---

## 🏷 Brand Proposals

Available-style names for this type of SaaS:

| Name | Domain | Notes |
|---|---|---|
| **DocForge** | docforge.app | Strong, professional |
| **PDFraft** | pdfraft.com | PDF + craft |
| **Folio.tools** | folio.tools | Clean, modern |
| **PaperFlow** | paperflow.io | Conversion-friendly |
| **DocPulse** | docpulse.app | Dynamic feel |

**Color palette (DocForge):**
- Primary: `#2563EB` (Professional blue)
- Accent: `#06B6D4` (Cyan for gradients)
- Success: `#10B981`
- Background: `#FFFFFF` / `#F8FAFC`

---

## 📜 License

Proprietary. All rights reserved — DocForge Inc.
