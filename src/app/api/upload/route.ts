import { NextRequest, NextResponse } from "next/server";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_PREMIUM } from "@/lib/validations";
import { randomUUID } from "crypto";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "File type not supported." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_PREMIUM) {
      return NextResponse.json({ error: "File size exceeds the 100MB limit." }, { status: 400 });
    }

    const storageKey = `uploads/${randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);

    const fileRecord = await prisma.file.create({
      data: {
        originalName: file.name,
        size: file.size,
        mimeType: file.type,
        storageKey,
        expiresAt,
      },
    });

    return NextResponse.json({
      file: {
        id: fileRecord.id,
        originalName: fileRecord.originalName,
        size: fileRecord.size,
        mimeType: fileRecord.mimeType,
        storageKey: fileRecord.storageKey,
        expiresAt: fileRecord.expiresAt,
        createdAt: fileRecord.createdAt,
      },
    });
  } catch (err) {
    console.error("[upload]", err);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
