import { NextResponse } from "next/server";
import { financeResources } from "@/features/finance/types";
import { proxyAdminRequest } from "@/lib/auth/admin-proxy";

type Context = { params: Promise<{ resource: string }> };

function valid(resource: string) {
  return financeResources.includes(
    resource as (typeof financeResources)[number],
  );
}

async function proxy(request: Request, context: Context) {
  const { resource } = await context.params;
  if (!valid(resource)) {
    return NextResponse.json(
      { message: "Unsupported Finance & Billing resource." },
      { status: 404 },
    );
  }
  return proxyAdminRequest(request, `/finance/${resource}`);
}

export const GET = proxy;
export const POST = proxy;

