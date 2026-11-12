import { proxyAdminRequest } from "@/lib/auth/admin-proxy";

export function GET(request: Request) {
  return proxyAdminRequest(request, "/platform-permissions");
}
