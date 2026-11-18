import { proxyAdminRequest } from "@/lib/auth/admin-proxy";

export function POST(request: Request) {
  return proxyAdminRequest(request, "/media");
}
