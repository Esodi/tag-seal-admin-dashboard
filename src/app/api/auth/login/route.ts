import { SESSION_SETTINGS } from "@/lib/constant_values";
import { adminCookieOptions } from "@/lib/auth/cookie-options";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  login: z.string().trim().min(1),
  password: z.string().min(1),
  remember: z.boolean().optional(),
  method: z.literal("password").optional(),
});
const apiUrl = process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8000";

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { message: "Enter your username or email and password." },
      { status: 422 },
    );

  try {
    const upstream = await fetch(`${apiUrl}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-App-Version": "2.0.0",
      },
      body: JSON.stringify({
        login: parsed.data.login,
        password: parsed.data.password,
        device_name: "Tag & Seal Admin Web",
      }),
      cache: "no-store",
    });
    const payload = await upstream
      .json()
      .catch(() => ({ message: "Authentication failed." }));
    const token = payload?.data?.access_token ?? payload?.data?.accessToken;
    if (!upstream.ok || !token) {
      const message =
        upstream.status >= 500
          ? "The Laravel authentication service is temporarily unavailable."
          : payload?.message || "Authentication failed.";
      return NextResponse.json({ message }, { status: upstream.status || 401 });
    }

    const { user } = payload.data;
    if (!["admin", "superAdmin"].includes(user?.platformRole)) {
      await fetch(`${apiUrl}/api/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }).catch(() => undefined);
      return NextResponse.json(
        {
          message:
            "Only active system administrators can access this dashboard.",
        },
        { status: 403 },
      );
    }

    const sessionSeconds = parsed.data.remember
      ? SESSION_SETTINGS.rememberMeDays * 24 * 60 * 60
      : SESSION_SETTINGS.signInHours * 60 * 60;
    const expiresAt = Date.now() + sessionSeconds * 1000;
    const response = NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        platformRole: user.platformRole,
        firstname: user.firstname,
        surname: user.surname,
      },
      expiresAt,
    });
    const options = adminCookieOptions(parsed.data.remember ? sessionSeconds : undefined);
    response.cookies.set("tagseal_admin_token", token, options);
    response.cookies.set(
      "tagseal_admin_user",
      Buffer.from(JSON.stringify(user)).toString("base64url"),
      options,
    );
    response.cookies.set(
      "tagseal_admin_expires_at",
      String(expiresAt),
      options,
    );
    return response;
  } catch {
    return NextResponse.json(
      { message: "The Laravel authentication service is unavailable." },
      { status: 503 },
    );
  }
}
