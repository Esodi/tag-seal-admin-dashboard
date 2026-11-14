/**
 * Session cookie flags for the admin Portal.
 *
 * Secure cookies are only sent on HTTPS. This Portal is often served over plain
 * http://host:3070 in production, so Secure must be off there or the browser
 * drops the login cookie and /dashboard bounces back to /login?returnTo=...
 *
 * Set COOKIE_SECURE=true when the Portal itself is served on HTTPS.
 */
export function adminCookieOptions(maxAgeSeconds?: number) {
  const secure =
    process.env.COOKIE_SECURE === "true" ||
    (process.env.COOKIE_SECURE !== "false" &&
      process.env.NODE_ENV === "production" &&
      (process.env.PORTAL_URL ?? "").startsWith("https://"));

  return {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    ...(maxAgeSeconds ? { maxAge: maxAgeSeconds } : {}),
  };
}
