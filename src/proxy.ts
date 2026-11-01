import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("tagseal_admin_token")?.value;
  const expiresAt = Number(request.cookies.get("tagseal_admin_expires_at")?.value ?? 0);
  const { pathname, search } = request.nextUrl;
  const isDashboard = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const isLogin = pathname === "/login";

  if (isDashboard) {
    if (!token || !expiresAt || expiresAt <= Date.now()) {
      const returnTo = `${pathname}${search}`;
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("returnTo", returnTo);
      if (token) {
        loginUrl.searchParams.set("expired", "1");
      }
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("tagseal_admin_token");
      response.cookies.delete("tagseal_admin_user");
      response.cookies.delete("tagseal_admin_expires_at");
      return response;
    }
  }

  if (isLogin) {
    if (token && expiresAt && expiresAt > Date.now()) {
      const returnTo = request.nextUrl.searchParams.get("returnTo");
      const target = returnTo && returnTo.startsWith("/dashboard") ? returnTo : "/dashboard";
      return NextResponse.redirect(new URL(target, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/login",
  ],
};
