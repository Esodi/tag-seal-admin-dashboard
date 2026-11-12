import { proxyAdminRequest } from "@/lib/auth/admin-proxy";

export async function GET(request: Request) {
  return proxyAdminRequest(request, "/dairy/transport/drivers");
}

export async function POST(request: Request) {
  return proxyAdminRequest(request, "/dairy/transport/drivers");
}
