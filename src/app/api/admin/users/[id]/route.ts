import { NextResponse } from "next/server";
import { AdminRole } from "@prisma/client";
import { hashPassword, requireSuperAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Ctx) {
  const session = await requireSuperAdmin();
  if (!session) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const { id } = await context.params;

  try {
    const body = await request.json();
    const data: {
      name?: string;
      role?: AdminRole;
      active?: boolean;
      passwordHash?: string;
    } = {};

    if (typeof body.name === "string" && body.name.trim()) {
      data.name = body.name.trim();
    }
    if (body.role === "SUPER_ADMIN" || body.role === "STAFF") {
      data.role = body.role;
    }
    if (typeof body.active === "boolean") {
      data.active = body.active;
    }
    if (typeof body.password === "string" && body.password.length >= 8) {
      data.passwordHash = await hashPassword(body.password);
    }

    // Prevent locking yourself out as the last super admin
    if (id === session.id && data.active === false) {
      return NextResponse.json({ error: "CANNOT_DISABLE_SELF" }, { status: 400 });
    }
    if (id === session.id && data.role === "STAFF") {
      return NextResponse.json({ error: "CANNOT_DEMOTING_SELF" }, { status: 400 });
    }

    const user = await prisma.adminUser.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("[admin/users PATCH]", error);
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: Ctx) {
  const session = await requireSuperAdmin();
  if (!session) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const { id } = await context.params;
  if (id === session.id) {
    return NextResponse.json({ error: "CANNOT_DELETE_SELF" }, { status: 400 });
  }

  try {
    await prisma.adminUser.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/users DELETE]", error);
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
