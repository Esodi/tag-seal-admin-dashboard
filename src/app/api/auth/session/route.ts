import { SESSION_SETTINGS } from "@/lib/constant_values";
import { adminCookieOptions } from "@/lib/auth/cookie-options";
import { canEnterPortal } from "@/lib/permissions";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const apiUrl = process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8000";

function unauthorized() {
  const response = NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
  response.cookies.delete("tagseal_admin_token");
  response.cookies.delete("tagseal_admin_user");
  response.cookies.delete("tagseal_admin_expires_at");
  return response;
}

export async function GET() {
  const store = await cookies();
  const token = store.get("tagseal_admin_token")?.value;
  const expiresAt = Number(store.get("tagseal_admin_expires_at")?.value ?? 0);
  const cachedUser = (() => {
    try {
      const value = store.get("tagseal_admin_user")?.value;
      return value ? JSON.parse(Buffer.from(value, "base64url").toString("utf8")) : null;
    } catch {
      return null;
    }
  })();

  if (!token || !expiresAt || expiresAt <= Date.now()) return unauthorized();

  try {
    const upstream = await fetch(`${apiUrl}/api/v1/admin/account/profile`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      cache: "no-store",
    });

    if (upstream.status === 401 || upstream.status === 403) return unauthorized();
    if (!upstream.ok) {
      return canEnterPortal(cachedUser)
        ? NextResponse.json({ user: cachedUser, profile: null, expiresAt, verified: false })
        : unauthorized();
    }

    const payload = await upstream.json();
    const source = payload?.data;
    if (!canEnterPortal(source)) return unauthorized();

    const profile = payload?.data ?? null;
    const user = {
      ...source,
      cooperativeRoles: source?.cooperativeRoles ?? cachedUser?.cooperativeRoles ?? [],
      permissions: source?.permissions ?? cachedUser?.permissions ?? [],
      firstname: profile?.firstName ?? profile?.firstname ?? source.firstname ?? cachedUser?.firstname ?? "",
      surname: profile?.lastName ?? profile?.surname ?? source.surname ?? cachedUser?.surname ?? "",
      phone1: profile?.phone ?? profile?.phone1 ?? cachedUser?.phone1 ?? "",
    };

    return NextResponse.json({ user, profile, expiresAt, verified: true });
  } catch {
    return canEnterPortal(cachedUser)
      ? NextResponse.json({ user: cachedUser, profile: null, expiresAt, verified: false })
      : NextResponse.json({ message: "Session service unavailable" }, { status: 503 });
  }
}

/** Keep-alive endpoint: refreshes the session expiration when user confirms activity */
export async function POST() {
  const store = await cookies();
  const token = store.get("tagseal_admin_token")?.value;
  const expiresAt = Number(store.get("tagseal_admin_expires_at")?.value ?? 0);

  if (!token || !expiresAt || expiresAt <= Date.now()) {
    return unauthorized();
  }

  const extensionSeconds = SESSION_SETTINGS.keepAliveHours * 60 * 60;
  const newExpiresAt = Date.now() + extensionSeconds * 1000;
  const response = NextResponse.json({ success: true, expiresAt: newExpiresAt });

  response.cookies.set("tagseal_admin_expires_at", String(newExpiresAt), adminCookieOptions());
  return response;
}
