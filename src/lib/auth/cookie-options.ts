/**
 * Session cookie flags for the admin Portal.
 *
 * Secure cookies are only sent on HTTPS.
 * When served over HTTPS (e.g. https://45.77.1.62.nip.io:3070), COOKIE_SECURE
 * defaults to true in production; for plain HTTP local/LAN testing, set
 * COOKIE_SECURE=false.
 */
export function adminCookieOptions(maxAgeSeconds?: number) {
  const portalUrl = process.env.PORTAL_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "";
  const secure =
    process.env.COOKIE_SECURE === "true" ||
    (process.env.COOKIE_SECURE !== "false" &&
      process.env.NODE_ENV === "production" &&
      portalUrl.startsWith("https://"));

  return {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    ...(maxAgeSeconds ? { maxAge: maxAgeSeconds } : {}),
  };
}
