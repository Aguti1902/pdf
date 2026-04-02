import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";

// GET /api/documents — list user's documents, or ?id=xxx for a single doc with fileData
export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { prisma } = await import("@/lib/prisma");
  const id = new URL(req.url).searchParams.get("id");

  if (id) {
    const doc = await prisma.document.findFirst({ where: { id, userId: session.userId } });
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ document: doc });
  }

  const docs = await prisma.document.findMany({
    where:   { userId: session.userId },
    orderBy: { updatedAt: "desc" },
    select:  { id: true, title: true, fileSize: true, pageCount: true, createdAt: true, updatedAt: true },
  });
  return NextResponse.json({ documents: docs });
}

// POST /api/documents — save / update a document
export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { prisma } = await import("@/lib/prisma");
  const body = await req.json();
  const { id, title, fileData, fileSize, annotations, pageCount } = body;

  if (!fileData || !title) return NextResponse.json({ error: "title and fileData required" }, { status: 400 });

  // Saving is free for all authenticated users — subscription is only required to DOWNLOAD.
  if (id) {
    // Update existing
    const doc = await prisma.document.update({
      where: { id, userId: session.userId },
      data:  { title, fileData, fileSize: fileSize ?? 0, annotations: annotations ?? [], pageCount: pageCount ?? 1 },
    });
    return NextResponse.json({ document: doc });
  }

  // Create new
  const doc = await prisma.document.create({
    data: { userId: session.userId, title, fileData, fileSize: fileSize ?? 0, annotations: annotations ?? [], pageCount: pageCount ?? 1 },
  });
  return NextResponse.json({ document: doc });
}

// DELETE /api/documents?id=xxx
export async function DELETE(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { prisma } = await import("@/lib/prisma");
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await prisma.document.deleteMany({ where: { id, userId: session.userId } });
  return NextResponse.json({ ok: true });
}
