import { NextResponse } from "next/server";
import {
  createAdminSession,
  hashPassword,
  requireAdminSession,
  verifyPassword,
} from "@/lib/auth";
import { removeAdminAvatar, saveAdminAvatar } from "@/lib/admin-avatar-storage";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: session.id,
      email: session.email,
      name: session.name,
      role: session.role,
      photoUrl: session.photoUrl,
    },
  });
}

export async function PATCH(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data: {
      name?: string;
      passwordHash?: string;
      photoUrl?: string | null;
    } = {};

    if (typeof body.name === "string") {
      const name = body.name.trim();
      if (name.length < 2) {
        return NextResponse.json({ error: "INVALID_NAME" }, { status: 400 });
      }
      data.name = name;
    }

    if (typeof body.password === "string" && body.password.length > 0) {
      if (body.password.length < 8) {
        return NextResponse.json({ error: "WEAK_PASSWORD" }, { status: 400 });
      }
      if (typeof body.currentPassword !== "string" || !body.currentPassword) {
        return NextResponse.json({ error: "CURRENT_PASSWORD_REQUIRED" }, { status: 400 });
      }
      const dbUser = await prisma.adminUser.findUnique({ where: { id: session.id } });
      if (!dbUser) {
        return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
      }
      const ok = await verifyPassword(body.currentPassword, dbUser.passwordHash);
      if (!ok) {
        return NextResponse.json({ error: "BAD_CURRENT_PASSWORD" }, { status: 400 });
      }
      data.passwordHash = await hashPassword(body.password);
    }

    if (body.removePhoto === true) {
      await removeAdminAvatar(session.id);
      data.photoUrl = null;
    } else if (typeof body.photoDataUrl === "string" && body.photoDataUrl) {
      try {
        data.photoUrl = await saveAdminAvatar(session.id, body.photoDataUrl);
      } catch {
        return NextResponse.json({ error: "INVALID_IMAGE" }, { status: 400 });
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "NO_CHANGES" }, { status: 400 });
    }

    const user = await prisma.adminUser.update({
      where: { id: session.id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        photoUrl: true,
      },
    });

    await createAdminSession({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      photoUrl: user.photoUrl,
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("[admin/profile PATCH]", error);
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
