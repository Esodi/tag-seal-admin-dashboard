import { proxyAdminRequest } from "@/lib/auth/admin-proxy";

type Context = { params: Promise<{ type: string }> };

export async function GET(request: Request, { params }: Context) {
  const { type } = await params;
  if (type !== "mcus" && type !== "amcos" && type !== "centres" && type !== "factories") return Response.json({ message: "Not found" }, { status: 404 });
  return proxyAdminRequest(request, `/dairy/cooperatives/${type}`);
}

export async function POST(request: Request, { params }: Context) {
  const { type } = await params;
  if (type !== "mcus" && type !== "amcos" && type !== "centres" && type !== "factories") return Response.json({ message: "Not found" }, { status: 404 });
  return proxyAdminRequest(request, `/dairy/cooperatives/${type}`);
}
