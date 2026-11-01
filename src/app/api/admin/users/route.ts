import { proxyAdminRequest } from "@/lib/auth/admin-proxy";

export function GET(request: Request) { return proxyAdminRequest(request, "/users"); }
export function POST(request: Request) { return proxyAdminRequest(request, "/users"); }
