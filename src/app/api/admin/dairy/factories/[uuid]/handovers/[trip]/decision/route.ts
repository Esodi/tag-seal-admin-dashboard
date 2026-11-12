import { proxyAdminRequest } from "@/lib/auth/admin-proxy";
export async function POST(request: Request, { params }: { params: Promise<{ uuid: string; trip: string }> }) {
  const { uuid, trip } = await params;
  return proxyAdminRequest(request, `/dairy/factories/${encodeURIComponent(uuid)}/handovers/${encodeURIComponent(trip)}/decision`);
}
