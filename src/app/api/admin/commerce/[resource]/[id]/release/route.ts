import { proxyAdminRequest } from "@/lib/auth/admin-proxy";

export async function POST(request: Request, { params }: { params: Promise<{ resource: string; id: string }> }) {
  const { resource, id } = await params;
  if (resource !== "reservations") return Response.json({ message: "Only holds can be released." }, { status: 404 });
  return proxyAdminRequest(request, `/commerce/reservations/${encodeURIComponent(id)}/release`);
}
