import "server-only";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { formatFriendlyError } from "@/lib/friendly-error";

const apiUrl = process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8000";

export async function proxyAdminRequest(request: Request, path: string) {
  const store = await cookies();
  const token = store.get("tagseal_admin_token")?.value;
  if (!token) return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });

  const sourceUrl = new URL(request.url);
  const target = `${apiUrl}/api/v1/admin${path}${sourceUrl.search}`;
  const body = request.method === "GET" || request.method === "HEAD" ? undefined : await request.text();

  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        ...(body ? { "Content-Type": request.headers.get("content-type") ?? "application/json" } : {}),
      },
      body: body || undefined,
      cache: "no-store",
    });

    const rawText = await upstream.text();
    let payload: Record<string, unknown> | null = null;
    try {
      payload = JSON.parse(rawText);
    } catch {
      payload = null;
    }

    // Sanitize technical SQL or server trace errors before returning to frontend
    if (upstream.status >= 400 && payload && typeof payload === "object") {
      const rawMessage = typeof payload.message === "string" ? payload.message : "";
      const friendlyMessage = formatFriendlyError(rawMessage);
      if (friendlyMessage !== rawMessage) {
        payload.message = friendlyMessage;
        // Strip sensitive internal stack trace fields if present
        delete payload.exception;
        delete payload.trace;
        delete payload.file;
        delete payload.line;
        return NextResponse.json(payload, { status: upstream.status });
      }
    }

    const response = new NextResponse(rawText, {
      status: upstream.status,
      headers: { "Content-Type": upstream.headers.get("content-type") ?? "application/json" },
    });

    if (upstream.status === 401) {
      response.cookies.delete("tagseal_admin_token");
      response.cookies.delete("tagseal_admin_user");
      response.cookies.delete("tagseal_admin_expires_at");
    }

    return response;
  } catch (error) {
    const friendly = formatFriendlyError(error, "The Laravel admin service is currently unavailable.");
    return NextResponse.json({ status: false, message: friendly }, { status: 503 });
  }
}
