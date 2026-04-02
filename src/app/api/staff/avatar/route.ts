import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { mkdir, writeFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export const runtime = "nodejs";

function getUploadDir() {
  const fromEnv = String(process.env.STAFF_IMAGE_UPLOAD_DIR || '').trim();
  if (fromEnv) {
    return fromEnv;
  }

  const cwdPublic = path.join(process.cwd(), "public", "staff-images");
  if (existsSync(path.join(process.cwd(), "public"))) {
    return cwdPublic;
  }

  // Fallback that commonly matches NAS/container mount layout.
  return "/app/public/staff-images";
}

function requireAdmin(req: NextRequest) {
  const user = getSessionUser(req);
  if (!user) {
    return { error: NextResponse.json({ message: "Sila login dahulu." }, { status: 401 }) };
  }
  if (user.role !== "admin") {
    return { error: NextResponse.json({ message: "Akses admin diperlukan." }, { status: 403 }) };
  }
  return { user };
}

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if ('error' in auth) {
    return auth.error;
  }

  try {
    const formData = await req.formData();
    const email = String(formData.get("email") || "").trim();
    const file = formData.get("file") as File | null;

    if (!email || !file) {
      return NextResponse.json({ message: "Email and file are required." }, { status: 400 });
    }

    const staff = await prisma.staff.findUnique({ where: { Emel: email }, select: { Emel: true } });
    if (!staff) {
      return NextResponse.json({ message: "Staff email not found in database." }, { status: 404 });
    }

    const allowed = [".jpg", ".jpeg", ".png", ".webp"];
    const originalName = file.name || "avatar.jpg";
    const ext = path.extname(originalName).toLowerCase();
    if (!allowed.includes(ext)) {
      return NextResponse.json({ message: "Only jpg, jpeg, png, webp are allowed." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const safeEmail = email.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const fileName = `${safeEmail}-${Date.now()}${ext}`;
    const uploadDir = getUploadDir();
    const filePath = path.join(uploadDir, fileName);
    const avatarPath = `/staff-images/${fileName}`;

    await mkdir(uploadDir, { recursive: true });
    await writeFile(filePath, buffer);

    await prisma.staff.update({
      where: { Emel: staff.Emel },
      data: { Avatar: avatarPath },
    });

    return NextResponse.json({ ok: true, avatar: avatarPath });
  } catch (error) {
    return NextResponse.json(
      { message: (error as Error).message || "Failed to upload avatar." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const auth = requireAdmin(req);
  if ('error' in auth) {
    return auth.error;
  }

  try {
    const body = await req.json();
    const email = String(body.email || "").trim();
    const avatar = String(body.avatar || "").trim();

    if (!email) {
      return NextResponse.json({ message: "Email is required." }, { status: 400 });
    }

    const staff = await prisma.staff.findUnique({ where: { Emel: email }, select: { Emel: true } });
    if (!staff) {
      return NextResponse.json({ message: "Staff email not found in database." }, { status: 404 });
    }

    await prisma.staff.update({
      where: { Emel: staff.Emel },
      data: { Avatar: avatar || "avatar1" },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { message: (error as Error).message || "Failed to update avatar." },
      { status: 500 }
    );
  }
}
