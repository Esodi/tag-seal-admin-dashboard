import { NextResponse } from "next/server";
import { referenceResources } from "@/features/reference/types";
import { proxyAdminRequest } from "@/lib/auth/admin-proxy";

type Context = { params: Promise<{ resource: string; id: string }> };

async function proxy(request: Request, context: Context) {
  const { resource, id } = await context.params;
  if (
    !referenceResources.includes(
      resource as (typeof referenceResources)[number],
    ) ||
    !/^\d+$/.test(id)
  ) {
    return NextResponse.json(
      { message: "Unsupported Reference Master Data record." },
      { status: 404 },
    );
  }
  return proxyAdminRequest(request, `/reference/${resource}/${id}`);
}

export const GET = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
