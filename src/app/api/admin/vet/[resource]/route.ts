import { vetResources, type VetResource } from "@/features/vet/types";
import { proxyAdminRequest } from "@/lib/auth/admin-proxy";

type Context = { params: Promise<{ resource: string }> };
const unsupported = () => Response.json({ message: "Unsupported veterinary resource." }, { status: 404 });

export async function GET(request: Request, { params }: Context) {
  const { resource } = await params;
  if (resource !== "form-options" && !vetResources.includes(resource as VetResource)) return unsupported();
  return proxyAdminRequest(request, `/vet/${resource}`);
}

export async function POST(request: Request, { params }: Context) {
  const { resource } = await params;
  if (resource === "vets") return proxyAdminRequest(request, "/vet/vets");
  if (resource === "requests") return proxyAdminRequest(request, "/vet/requests");
  return unsupported();
}
