import { NextResponse } from "next/server";
import { getTurnstileSiteKey, isTurnstileEnabled } from "@/lib/turnstile";

export const dynamic = "force-dynamic";

export async function GET() {
  const enabled = isTurnstileEnabled();
  return NextResponse.json(
    {
      enabled,
      siteKey: enabled ? getTurnstileSiteKey() : "",
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
