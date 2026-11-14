import { cookies } from "next/headers";
import { adminCookieOptions } from "@/lib/auth/cookie-options";
import { proxyAdminRequest } from "@/lib/auth/admin-proxy";

export async function GET(request: Request) {
  return proxyAdminRequest(request, "/account/profile");
}

export async function PATCH(request: Request) {
  const response = await proxyAdminRequest(request, "/account/profile");
  if (response.ok) {
    const { data } = await response.clone().json();
    const user = {
      id: data.id, username: data.username, email: data.email, role: data.role,
      platformRole: data.platformRole, status: data.status,
      firstname: data.firstName, surname: data.lastName, phone1: data.phone,
    };
    const store = await cookies();
    const expiresAt = Number(store.get("tagseal_admin_expires_at")?.value);
    response.cookies.set("tagseal_admin_user", Buffer.from(JSON.stringify(user)).toString("base64url"), {
      ...adminCookieOptions(),
      ...(Number.isFinite(expiresAt) && expiresAt > Date.now() ? { expires: new Date(expiresAt) } : {}),
    });
  }
  return response;
}

export async function DELETE(request: Request) {
  const response = await proxyAdminRequest(request, "/account/profile");
  if (response.ok) {
    response.cookies.delete("tagseal_admin_token");
    response.cookies.delete("tagseal_admin_user");
    response.cookies.delete("tagseal_admin_expires_at");
  }
  return response;
}
