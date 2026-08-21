import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const MIME_OK = new Set(["image/jpeg", "image/png", "image/webp"]);

export function avatarsDir() {
  return path.join(process.cwd(), "public", "uploads", "avatars");
}

export function avatarPublicPath(userId: string, version: number) {
  return `/uploads/avatars/${userId}.jpg?v=${version}`;
}

function parseDataUrl(dataUrl: string): { mime: string; buffer: Buffer } | null {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=\s]+)$/.exec(
    dataUrl.trim(),
  );
  if (!match) return null;
  const mime = match[1].toLowerCase();
  if (!MIME_OK.has(mime)) return null;
  const buffer = Buffer.from(match[2].replace(/\s/g, ""), "base64");
  if (!buffer.length || buffer.length > MAX_BYTES) return null;
  return { mime, buffer };
}

/** Persist a cropped avatar data-URL as JPEG under public/uploads/avatars. */
export async function saveAdminAvatar(
  userId: string,
  dataUrl: string,
): Promise<string> {
  const parsed = parseDataUrl(dataUrl);
  if (!parsed) {
    throw new Error("INVALID_IMAGE");
  }

  const dir = avatarsDir();
  await mkdir(dir, { recursive: true });
  const filePath = path.join(dir, `${userId}.jpg`);
  await writeFile(filePath, parsed.buffer);
  return avatarPublicPath(userId, Date.now());
}

export async function removeAdminAvatar(userId: string) {
  const filePath = path.join(avatarsDir(), `${userId}.jpg`);
  try {
    await unlink(filePath);
  } catch {
    // ignore missing file
  }
}
