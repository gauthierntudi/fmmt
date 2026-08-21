"use client";

import { adminAvatarColors, adminInitials } from "@/lib/admin-initials";

type Props = {
  name: string;
  userId: string;
  photoUrl?: string | null;
  className?: string;
  size?: number;
};

export function AdminAvatar({
  name,
  userId,
  photoUrl,
  className = "admin-top-avatar",
  size,
}: Props) {
  const initials = adminInitials(name);
  const colors = adminAvatarColors(userId || name);
  const style = size
    ? { ...colors, width: size, height: size, fontSize: size > 48 ? "1.1rem" : undefined }
    : colors;

  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt=""
        className={`${className} is-photo`}
        style={size ? { width: size, height: size } : undefined}
        aria-hidden
      />
    );
  }

  return (
    <span className={className} style={style} aria-hidden>
      {initials}
    </span>
  );
}
