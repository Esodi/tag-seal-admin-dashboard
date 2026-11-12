import { proxyAdminRequest } from "@/lib/auth/admin-proxy";

type Context = { params: Promise<{ uuid: string; action: string }> };

export async function POST(request: Request, { params }: Context) {
  const { uuid, action } = await params;
  if (action !== "approve" && action !== "reject" && action !== "restore") return Response.json({ message: "Not found" }, { status: 404 });
  return proxyAdminRequest(request, `/dairy/transport/companies/${encodeURIComponent(uuid)}/${action}`);
}
