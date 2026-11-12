import { proxyAdminRequest } from "@/lib/auth/admin-proxy";

export async function GET(request: Request) {
  return proxyAdminRequest(request, "/security/upgrade-runs");
}

