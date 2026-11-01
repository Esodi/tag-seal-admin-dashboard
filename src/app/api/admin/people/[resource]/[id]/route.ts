import { NextResponse } from "next/server";
import { peopleResources } from "@/features/people/types";
import { proxyAdminRequest } from "@/lib/auth/admin-proxy";

type Context = { params: Promise<{ resource: string; id: string }> };

async function proxy(request: Request, context: Context) {
  const { resource, id } = await context.params;
  if (!peopleResources.includes(resource as (typeof peopleResources)[number]) || !/^\d+$/.test(id)) {
    return NextResponse.json({ message: "Unsupported People & Organization record." }, { status: 404 });
  }
  return proxyAdminRequest(request, `/people/${resource}/${id}`);
}

export const GET = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
