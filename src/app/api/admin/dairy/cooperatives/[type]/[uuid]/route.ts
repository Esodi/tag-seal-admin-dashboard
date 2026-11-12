import { proxyAdminRequest } from "@/lib/auth/admin-proxy";

type Context = { params: Promise<{ type: string; uuid: string }> };

export async function PATCH(request: Request, { params }: Context) {
  const { type, uuid } = await params;
  if (type !== "mcus" && type !== "amcos" && type !== "centres" && type !== "factories") return Response.json({ message: "Not found" }, { status: 404 });
  return proxyAdminRequest(request, `/dairy/cooperatives/${type}/${encodeURIComponent(uuid)}`);
}

export async function GET(request: Request, { params }: Context) {
  const { type, uuid } = await params;
  if (type !== "factories") return Response.json({ message: "Not found" }, { status: 404 });
  return proxyAdminRequest(request, `/dairy/cooperatives/${type}/${encodeURIComponent(uuid)}`);
}
