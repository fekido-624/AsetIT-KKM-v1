import { existsSync } from "fs";
import path from "path";

export function getUploadDir() {
  const fromEnv = String(process.env.STAFF_IMAGE_UPLOAD_DIR || "").trim();
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

export function buildAvatarApiPath(fileName: string) {
  return `/api/staff/avatar/files/${fileName}`;
}
