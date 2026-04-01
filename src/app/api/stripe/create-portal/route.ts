import { NextRequest, NextResponse } from "next/server";
import { SITE } from "@/config/seo";

export async function POST(req: NextRequest) {
  try {
    const { createCustomerPortalSession } = await import("@/lib/stripe");
    const body = await req.json().catch(() => ({}));
    const customerId: string = body.customerId ?? process.env.STRIPE_TEST_CUSTOMER_ID ?? "";

    if (!customerId) {
      return NextResponse.json({ error: "Customer not found." }, { status: 400 });
    }

    const session = await createCustomerPortalSession(
      customerId,
      `${SITE.url}/dashboard/billing`
    );

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[create-portal]", err);
    return NextResponse.json(
      { error: "Failed to create portal session." },
      { status: 500 }
    );
  }
}
