import { NextResponse } from "next/server";
import { eventResources } from "@/features/events/types";
import { proxyAdminRequest } from "@/lib/auth/admin-proxy";

type Context = { params: Promise<{ resource: string }> };

function valid(resource: string) {
  return eventResources.includes(
    resource as (typeof eventResources)[number],
  );
}

async function proxy(request: Request, context: Context) {
  const { resource } = await context.params;
  if (!valid(resource)) {
    return NextResponse.json(
      { message: "Unsupported Events & Logs resource." },
      { status: 404 },
    );
  }
  return proxyAdminRequest(request, `/events/${resource}`);
}

export const GET = proxy;
export const POST = proxy;

