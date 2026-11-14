import "server-only";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { formatFriendlyError } from "@/lib/friendly-error";

const apiUrl = process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8000";

/** Streams an uploaded file (PDF, image) from the admin API; JSON errors pass through as they are. */
export async function proxyAdminFile(path: string) {
  const token = (await cookies()).get("tagseal_admin_token")?.value;
  if (!token) return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });
  try {
    const upstream = await fetch(`${apiUrl}/api/v1/admin${path}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    const headers = new Headers({ "Content-Type": upstream.headers.get("content-type") ?? "application/octet-stream" });
    const disposition = upstream.headers.get("content-disposition");
    if (disposition) headers.set("Content-Disposition", disposition.replace(/^attachment/i, "inline"));
    return new NextResponse(upstream.body, { status: upstream.status, headers });
  } catch (error) {
    const friendly = formatFriendlyError(error, "The Laravel admin service is currently unavailable.");
    return NextResponse.json({ status: false, message: friendly }, { status: 503 });
  }
}
