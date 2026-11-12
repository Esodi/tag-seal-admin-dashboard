import { proxyAdminRequest } from "@/lib/auth/admin-proxy";

type Context = { params: Promise<{ uuid: string; memberUuid: string }> };

export async function PATCH(request: Request, { params }: Context) {
  const { uuid, memberUuid } = await params;
  return proxyAdminRequest(request, `/dairy/factories/${encodeURIComponent(uuid)}/members/${encodeURIComponent(memberUuid)}`);
}

export async function DELETE(request: Request, { params }: Context) {
  const { uuid, memberUuid } = await params;
  return proxyAdminRequest(request, `/dairy/factories/${encodeURIComponent(uuid)}/members/${encodeURIComponent(memberUuid)}`);
}
