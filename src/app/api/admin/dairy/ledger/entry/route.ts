import { proxyAdminRequest } from "@/lib/auth/admin-proxy";

export async function POST(request: Request) {
  return proxyAdminRequest(request, "/dairy/ledger/entry");
}
