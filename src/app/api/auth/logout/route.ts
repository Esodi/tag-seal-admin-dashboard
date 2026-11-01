import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const apiUrl = process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8000";

export async function POST() {
  const store = await cookies();
  const token = store.get("tagseal_admin_token")?.value;
  if (token) await fetch(`${apiUrl}/api/auth/logout`, { method: "POST", headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }, cache: "no-store" }).catch(() => undefined);
  const response = NextResponse.json({ status: true });
  response.cookies.delete("tagseal_admin_token");
  response.cookies.delete("tagseal_admin_user");
  response.cookies.delete("tagseal_admin_expires_at");
  return response;
}
