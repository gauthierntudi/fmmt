import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import type { AdminRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "fmmt_admin_session";

export type AdminSession = {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  photoUrl: string | null;
};

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createAdminSession(user: AdminSession) {
  const token = await new SignJWT({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    photoUrl: user.photoUrl,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    const id = String(payload.sub || "");
    const email = String(payload.email || "");
    const name = String(payload.name || "");
    const role = payload.role as AdminRole;
    const photoUrl =
      typeof payload.photoUrl === "string" && payload.photoUrl
        ? payload.photoUrl
        : null;
    if (!id || !email || (role !== "SUPER_ADMIN" && role !== "STAFF")) {
      return null;
    }
    return { id, email, name, role, photoUrl };
  } catch {
    return null;
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  return Boolean(await requireAdminSession());
}

export async function requireAdminSession(): Promise<AdminSession | null> {
  const session = await getAdminSession();
  if (!session) return null;

  try {
    const user = await prisma.adminUser.findUnique({ where: { id: session.id } });
    if (!user || !user.active) {
      // Do not clear cookies here — Server Components cannot mutate cookies.
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      photoUrl: user.photoUrl,
    };
  } catch {
    return null;
  }
}

export async function requireSuperAdmin(): Promise<AdminSession | null> {
  const session = await requireAdminSession();
  if (!session || session.role !== "SUPER_ADMIN") return null;
  return session;
}

export async function authenticateAdmin(
  email: string,
  password: string,
): Promise<AdminSession | null> {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !password) return null;

  const user = await prisma.adminUser.findUnique({ where: { email: normalized } });
  if (!user || !user.active) return null;

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    photoUrl: user.photoUrl,
  };
}

/** @deprecated use authenticateAdmin — kept for transitional imports */
export function verifyAdminPassword(_password: string): boolean {
  return false;
}
