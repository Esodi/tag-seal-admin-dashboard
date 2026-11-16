import { proxyAdminFile } from "@/lib/auth/admin-file-proxy";
import { proxyAdminRequest } from "@/lib/auth/admin-proxy";

type Context = { params: Promise<{ resource: string; id: string; action: string }> };

const unsupported = () => Response.json({ message: "Unsupported veterinary action." }, { status: 404 });

export async function GET(_request: Request, { params }: Context) {
  const { resource, id, action } = await params;
  if (resource === "vets" && /^\d+$/.test(id) && action === "license-document") {
    return proxyAdminFile(`/vet/vets/${id}/license-document`);
  }
  return unsupported();
}

export async function POST(request: Request, { params }: Context) {
  const { resource, id, action } = await params;
  if (resource === "vets" && /^\d+$/.test(id) && (action === "approve" || action === "reject")) {
    return proxyAdminRequest(request, `/vet/vets/${id}/${action}`);
  }
  if (resource === "requests" && (action === "cancel" || action === "redispatch")) {
    return proxyAdminRequest(request, `/vet/requests/${id}/${action}`);
  }
  return unsupported();
}
