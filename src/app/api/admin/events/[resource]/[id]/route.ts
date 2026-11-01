import { NextResponse } from "next/server";
import { eventResources } from "@/features/events/types";
import { proxyAdminRequest } from "@/lib/auth/admin-proxy";

type Context = { params: Promise<{ resource: string; id: string }> };

async function proxy(request: Request, context: Context) {
  const { resource, id } = await context.params;
  if (
    !eventResources.includes(
      resource as (typeof eventResources)[number],
    ) ||
    !/^\d+$/.test(id)
  ) {
    return NextResponse.json(
      { message: "Unsupported Events & Logs record." },
      { status: 404 },
    );
  }
  if (request.method === "POST") {
    return proxyAdminRequest(request, `/events/${resource}/${id}/restore`);
  }
  return proxyAdminRequest(request, `/events/${resource}/${id}`);
}

export const GET = proxy;
export const PATCH = proxy;
export const POST = proxy;
export const DELETE = proxy;

