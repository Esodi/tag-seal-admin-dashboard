import { proxyAdminRequest } from "@/lib/auth/admin-proxy";

type Context = { params: Promise<{ resource: string; id: string }> };

async function forward(request: Request, { params }: Context) {
  const { resource, id } = await params;
  if (resource !== "vets" || !/^\d+$/.test(id)) return Response.json({ message: "Unsupported veterinary resource." }, { status: 404 });
  return proxyAdminRequest(request, `/vet/vets/${id}`);
}

export { forward as GET, forward as PUT };
