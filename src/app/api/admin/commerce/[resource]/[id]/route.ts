import { commerceResources, type CommerceResource } from "@/features/commerce/types";
import { proxyAdminRequest } from "@/lib/auth/admin-proxy";

export async function GET(request: Request, { params }: { params: Promise<{ resource: string; id: string }> }) {
  const { resource, id } = await params;
  if (!commerceResources.includes(resource as CommerceResource)) return Response.json({ message: "Unsupported commerce resource." }, { status: 404 });
  return proxyAdminRequest(request, `/commerce/${resource}/${encodeURIComponent(id)}`);
}
