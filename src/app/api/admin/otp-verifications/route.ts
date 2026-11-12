import { proxyAdminRequest } from "@/lib/auth/admin-proxy";

export async function GET(request: Request) {
  return proxyAdminRequest(request, "/otp-verifications");
}
export async function POST(request: Request) {
  return proxyAdminRequest(request, "/otp-verifications");
}
