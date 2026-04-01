import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // TODO: get real session user and fetch from DB
  // For now return mock data for development
  return NextResponse.json({
    status: "free",
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    plan: null,
  });
}
