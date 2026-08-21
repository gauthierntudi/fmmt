/** Two-letter initials for admin avatars (e.g. "Jean Dupont" → "JD"). */
export function adminInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return "??";

  if (parts.length === 1) {
    const word = parts[0];
    const a = word[0] ?? "?";
    const b = word[1] ?? a;
    return `${a}${b}`.toUpperCase();
  }

  const first = parts[0][0] ?? "?";
  const last = parts[parts.length - 1][0] ?? "?";
  return `${first}${last}`.toUpperCase();
}

const AVATAR_PALETTE = [
  { bg: "#FF3B5C", fg: "#FFFFFF" },
  { bg: "#FF6B00", fg: "#FFFFFF" },
  { bg: "#FFB800", fg: "#1A1200" },
  { bg: "#00C853", fg: "#FFFFFF" },
  { bg: "#00B8D4", fg: "#FFFFFF" },
  { bg: "#2979FF", fg: "#FFFFFF" },
  { bg: "#651FFF", fg: "#FFFFFF" },
  { bg: "#D500F9", fg: "#FFFFFF" },
  { bg: "#F50057", fg: "#FFFFFF" },
  { bg: "#00BFA5", fg: "#FFFFFF" },
  { bg: "#FF1744", fg: "#FFFFFF" },
  { bg: "#304FFE", fg: "#FFFFFF" },
] as const;

function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** Stable vivid avatar colors from a seed (user id or name). */
export function adminAvatarColors(seed: string): { background: string; color: string } {
  const entry = AVATAR_PALETTE[hashSeed(seed.trim() || "?") % AVATAR_PALETTE.length];
  return { background: entry.bg, color: entry.fg };
}
