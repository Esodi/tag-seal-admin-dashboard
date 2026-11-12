import { proxyAdminRequest } from "@/lib/auth/admin-proxy";

type Context = { params: Promise<{ uuid: string }> };

export async function POST(request: Request, { params }: Context) {
  const { uuid } = await params;
  return proxyAdminRequest(request, `/dairy/cooperatives/approvals/${encodeURIComponent(uuid)}/review`);
}
