import { NextRequest, NextResponse } from "next/server";
import { access, readFile } from "fs/promises";
import path from "path";
import { getUploadDir } from "@/lib/staff-avatar-storage";

export const runtime = "nodejs";

function getContentType(ext: string) {
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  return "application/octet-stream";
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { fileName: string } }
) {
  try {
    const fileName = String(params.fileName || "").trim();
    if (!fileName || fileName.includes("/") || fileName.includes("\\")) {
      return NextResponse.json({ message: "Invalid file name." }, { status: 400 });
    }

    const filePath = path.join(getUploadDir(), fileName);
    await access(filePath);
    const buffer = await readFile(filePath);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": getContentType(path.extname(fileName).toLowerCase()),
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ message: "Avatar not found." }, { status: 404 });
  }
}
