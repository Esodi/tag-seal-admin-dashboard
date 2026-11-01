import { NextResponse } from "next/server";
import { locationResources } from "@/features/locations/types";
import { proxyAdminRequest } from "@/lib/auth/admin-proxy";

type Context = { params: Promise<{ resource: string }> };

function valid(resource: string) {
  return locationResources.includes(
    resource as (typeof locationResources)[number],
  );
}

async function proxy(request: Request, context: Context) {
  const { resource } = await context.params;
  if (!valid(resource)) {
    return NextResponse.json(
      { message: "Unsupported Geographical Locations resource." },
      { status: 404 },
    );
  }
  return proxyAdminRequest(request, `/locations/${resource}`);
}

export const GET = proxy;
export const POST = proxy;

