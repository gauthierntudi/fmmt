import { NextResponse } from "next/server";
import { authenticateAdmin, createAdminSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "");
    const password = String(body.password || "");

    const user = await authenticateAdmin(email, password);
    if (!user) {
      return NextResponse.json({ error: "INVALID" }, { status: 401 });
    }

    await createAdminSession(user);
    return NextResponse.json({
      ok: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    console.error("[admin/login]", error);
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
