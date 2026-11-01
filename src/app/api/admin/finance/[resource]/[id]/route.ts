import { NextResponse } from "next/server";
import { financeResources } from "@/features/finance/types";
import { proxyAdminRequest } from "@/lib/auth/admin-proxy";

type Context = { params: Promise<{ resource: string; id: string }> };

async function proxy(request: Request, context: Context) {
  const { resource, id } = await context.params;
  if (
    !financeResources.includes(
      resource as (typeof financeResources)[number],
    ) ||
    !/^\d+$/.test(id)
  ) {
    return NextResponse.json(
      { message: "Unsupported Finance & Billing record." },
      { status: 404 },
    );
  }
  return proxyAdminRequest(request, `/finance/${resource}/${id}`);
}

export const GET = proxy;
export const PATCH = proxy;
export const DELETE = proxy;

