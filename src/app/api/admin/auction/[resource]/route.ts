import { auctionResources, type AuctionResource } from "@/features/auction/types";
import { proxyAdminRequest } from "@/lib/auth/admin-proxy";

type Context = { params: Promise<{ resource: string }> };
const unsupported = () => Response.json({ message: "Unsupported auction resource." }, { status: 404 });

export async function GET(request: Request, { params }: Context) {
  const { resource } = await params;
  if (!auctionResources.includes(resource as AuctionResource)) return unsupported();
  return proxyAdminRequest(request, `/auction/${resource}`);
}

export async function POST(request: Request, { params }: Context) {
  const { resource } = await params;
  if (resource !== "centres" && resource !== "officers") return unsupported();
  return proxyAdminRequest(request, `/auction/${resource}`);
}
