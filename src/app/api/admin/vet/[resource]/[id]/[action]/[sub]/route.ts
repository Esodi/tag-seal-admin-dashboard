import { proxyAdminFile } from "@/lib/auth/admin-file-proxy";

type Context = { params: Promise<{ resource: string; id: string; action: string; sub: string }> };

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(_request: Request, { params }: Context) {
  const { resource, id, action, sub } = await params;
  if (resource !== "vets" || !/^\d+$/.test(id) || action !== "documents" || !uuid.test(sub)) {
    return Response.json({ message: "Unsupported veterinary document." }, { status: 404 });
  }
  return proxyAdminFile(`/vet/vets/${id}/documents/${sub}`);
}
