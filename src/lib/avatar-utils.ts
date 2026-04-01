import { PlaceHolderImages } from "@/lib/placeholder-images";

export function resolveAvatarSrc(avatarValue: string | undefined): string | undefined {
  const value = (avatarValue || "").trim();
  if (!value) {
    return undefined;
  }

  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/")) {
    return value;
  }

  const legacy = PlaceHolderImages.find((img) => img.id === value);
  if (legacy?.imageUrl) {
    return legacy.imageUrl;
  }

  // If only filename provided, resolve from public/staff-images.
  return `/staff-images/${value}`;
}
