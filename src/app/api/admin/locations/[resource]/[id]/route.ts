import { NextResponse } from "next/server";
import { locationResources } from "@/features/locations/types";
import { proxyAdminRequest } from "@/lib/auth/admin-proxy";

type Context = { params: Promise<{ resource: string; id: string }> };

async function proxy(request: Request, context: Context) {
  const { resource, id } = await context.params;
  if (
    !locationResources.includes(
      resource as (typeof locationResources)[number],
    ) ||
    !/^\d+$/.test(id)
  ) {
    return NextResponse.json(
      { message: "Unsupported Geographical Locations record." },
      { status: 404 },
    );
  }
  return proxyAdminRequest(request, `/locations/${resource}/${id}`);
}

export const GET = proxy;
export const PATCH = proxy;
export const DELETE = proxy;

