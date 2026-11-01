import "server-only";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

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
    const response = new NextResponse(await upstream.text(), {
      status: upstream.status,
      headers: { "Content-Type": upstream.headers.get("content-type") ?? "application/json" },
    });
    if (upstream.status === 401) {
      response.cookies.delete("tagseal_admin_token");
      response.cookies.delete("tagseal_admin_user");
      response.cookies.delete("tagseal_admin_expires_at");
    }
    return response;
  } catch {
    return NextResponse.json({ message: "The Laravel admin service is unavailable." }, { status: 503 });
  }
}
