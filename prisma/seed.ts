import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Seed demo users
  const user1 = await prisma.user.upsert({
    where: { email: "demo@docforge.app" },
    update: {},
    create: {
      email: "demo@docforge.app",
      name: "Demo User",
      emailVerified: true,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "premium@docforge.app" },
    update: {},
    create: {
      email: "premium@docforge.app",
      name: "Premium User",
      emailVerified: true,
      stripeCustomerId: "cus_demo_12345",
    },
  });

  console.log("✓ Created users:", user1.email, user2.email);

  // Seed demo files
  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);

  await prisma.file.createMany({
    data: [
      {
        userId: user1.id,
        originalName: "Contract_Q1_2026.pdf",
        size: 245760,
        mimeType: "application/pdf",
        storageKey: "uploads/demo-contract-q1.pdf",
        expiresAt,
      },
      {
        userId: user1.id,
        originalName: "Invoice_March_2026.pdf",
        size: 1200000,
        mimeType: "application/pdf",
        storageKey: "uploads/demo-invoice-march.pdf",
        expiresAt,
      },
    ],
    skipDuplicates: true,
  });

  console.log("✓ Created demo files");

  // Seed demo blog posts
  await prisma.blogPost.createMany({
    data: [
      {
        slug: "how-to-sign-pdf-online",
        title: "How to Sign a PDF Online in 3 Steps",
        excerpt: "Learn the fastest way to add a digital signature to any PDF document.",
        content: "Full article content goes here...",
        author: "DocForge Team",
        tags: ["tutorial", "sign-pdf"],
        published: true,
        publishedAt: new Date("2026-03-28"),
      },
      {
        slug: "compress-pdf-without-losing-quality",
        title: "How to Compress a PDF Without Losing Quality",
        excerpt: "Reduce PDF file size while keeping your content sharp.",
        content: "Full article content goes here...",
        author: "DocForge Team",
        tags: ["guide", "compress-pdf"],
        published: true,
        publishedAt: new Date("2026-03-22"),
      },
    ],
    skipDuplicates: true,
  });

  console.log("✓ Created blog posts");

  // Seed demo coupon
  await prisma.coupon.upsert({
    where: { code: "WELCOME50" },
    update: {},
    create: {
      code: "WELCOME50",
      discountPercent: 50,
      maxRedemptions: 1000,
      active: true,
    },
  });

  console.log("✓ Created coupon: WELCOME50 (50% off)");
  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
