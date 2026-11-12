import { proxyAdminRequest } from "@/lib/auth/admin-proxy";

type Context = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: Context) {
  const { id } = await context.params;
  return proxyAdminRequest(request, `/platform-permissions/${id}`);
}
