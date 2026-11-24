import { proxyAdminRequest } from "@/lib/auth/admin-proxy";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ uuid: string }> },
) {
  const { uuid } = await params;
  return proxyAdminRequest(
    request,
    `/dairy/factories/${encodeURIComponent(uuid)}/transactions`,
  );
}
