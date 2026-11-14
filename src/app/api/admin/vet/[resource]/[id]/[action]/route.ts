import { proxyAdminFile } from "@/lib/auth/admin-file-proxy";
import { proxyAdminRequest } from "@/lib/auth/admin-proxy";

type Context = { params: Promise<{ resource: string; id: string; action: string }> };

const valid = (resource: string, id: string) => resource === "vets" && /^\d+$/.test(id);
const unsupported = () => Response.json({ message: "Unsupported veterinary action." }, { status: 404 });

export async function GET(_request: Request, { params }: Context) {
  const { resource, id, action } = await params;
  if (!valid(resource, id) || action !== "license-document") return unsupported();
  return proxyAdminFile(`/vet/vets/${id}/license-document`);
}

export async function POST(request: Request, { params }: Context) {
  const { resource, id, action } = await params;
  if (!valid(resource, id) || (action !== "approve" && action !== "reject")) return unsupported();
  return proxyAdminRequest(request, `/vet/vets/${id}/${action}`);
}
