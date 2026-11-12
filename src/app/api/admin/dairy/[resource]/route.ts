import { dairyResources, type DairyResource } from "@/features/dairy/types";
import { proxyAdminRequest } from "@/lib/auth/admin-proxy";

export async function GET(request: Request, { params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params;
  if (!dairyResources.includes(resource as DairyResource)) return Response.json({ message: "Unsupported dairy resource." }, { status: 404 });
  return proxyAdminRequest(request, `/dairy/${resource}`);
}
