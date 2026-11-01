import { NextResponse } from "next/server";
import { locationResources } from "@/features/locations/types";
import { proxyAdminRequest } from "@/lib/auth/admin-proxy";

type Context = { params: Promise<{ resource: string }> };

export async function GET(request: Request, context: Context) {
  const { resource } = await context.params;
  if (
    !locationResources.includes(
      resource as (typeof locationResources)[number],
    )
  ) {
    return NextResponse.json(
      { message: "Unsupported Geographical Locations resource." },
      { status: 404 },
    );
  }
  return proxyAdminRequest(request, `/locations/${resource}/options`);
}

