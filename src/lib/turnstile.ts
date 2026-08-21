/**
 * Turnstile is active only when enabled for production.
 * Local: NODE_ENV=development → skipped even if keys are in .env
 * Docker local: TURNSTILE_ENABLED=false (compose)
 * VPS: TURNSTILE_ENABLED=true + keys
 */

function cleanEnv(value: string | undefined) {
  return (value ?? "").trim().replace(/^['"]|['"]$/g, "");
}

export function getTurnstileSiteKey() {
  return cleanEnv(process.env.TURNSTILE_SITE_KEY);
}

export function getTurnstileSecretKey() {
  return cleanEnv(process.env.TURNSTILE_SECRET_KEY);
}

export function isTurnstileEnabled() {
  const flag = cleanEnv(process.env.TURNSTILE_ENABLED).toLowerCase();
  if (flag === "false" || flag === "0" || flag === "off" || flag === "no") {
    return false;
  }

  const site = getTurnstileSiteKey();
  const secret = getTurnstileSecretKey();
  if (!site || !secret) return false;

  if (flag === "true" || flag === "1" || flag === "on" || flag === "yes") {
    return true;
  }

  return process.env.NODE_ENV === "production";
}

export async function verifyTurnstileToken(
  token: string | undefined | null,
  remoteIp?: string | null,
): Promise<boolean> {
  if (!isTurnstileEnabled()) return true;

  if (!token || typeof token !== "string" || token.length < 10) {
    console.warn("[turnstile] missing token");
    return false;
  }

  const secret = getTurnstileSecretKey();
  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", token);
  if (remoteIp && remoteIp !== "127.0.0.1" && remoteIp !== "::1") {
    body.set("remoteip", remoteIp);
  }

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
    });
    const data = (await res.json()) as { success?: boolean; "error-codes"?: string[] };
    if (!data.success) {
      console.warn("[turnstile] siteverify failed", data["error-codes"] ?? data);
    }
    return Boolean(data.success);
  } catch (error) {
    console.error("[turnstile] verify failed", error);
    return false;
  }
}
