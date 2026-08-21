import { NextResponse } from "next/server";
import { clearAdminSession } from "@/lib/auth";

export async function POST() {
  await clearAdminSession();
  return NextResponse.json({ ok: true });
}

/** Clear a stale session cookie (useful after seed / local auth changes). */
export async function GET(request: Request) {
  await clearAdminSession();
  return NextResponse.redirect(new URL("/admin/login", request.url));
}
