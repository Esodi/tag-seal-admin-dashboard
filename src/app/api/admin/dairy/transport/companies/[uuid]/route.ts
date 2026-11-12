import { proxyAdminRequest } from "@/lib/auth/admin-proxy";

type Context = { params: Promise<{ uuid: string }> };

async function forward(request: Request, { params }: Context) {
  const { uuid } = await params;
  return proxyAdminRequest(request, `/dairy/transport/companies/${encodeURIComponent(uuid)}`);
}

export const GET = forward;
export const PATCH = forward;
export const DELETE = forward;
