import { proxyAdminRequest } from "@/lib/auth/admin-proxy";

type Context = { params: Promise<{ resource: string; id: string; action: string; sub: string }> };

async function forward(request: Request, { params }: Context) {
  const { resource, id, action, sub } = await params;
  if (resource !== "centres" || action !== "members" || !/^\d+$/.test(sub)) return Response.json({ message: "Unsupported auction action." }, { status: 404 });
  return proxyAdminRequest(request, `/auction/centres/${encodeURIComponent(id)}/members/${sub}`);
}

export { forward as PUT, forward as DELETE };
