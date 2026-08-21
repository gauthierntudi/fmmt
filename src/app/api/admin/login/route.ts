import { NextResponse } from "next/server";
import { createAdminSession, verifyAdminPassword } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const password = String(body.password || "");
  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: "INVALID" }, { status: 401 });
  }
  await createAdminSession();
  return NextResponse.json({ ok: true });
}
