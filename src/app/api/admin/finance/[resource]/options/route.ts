import { NextResponse } from "next/server";
import { financeResources } from "@/features/finance/types";
import { proxyAdminRequest } from "@/lib/auth/admin-proxy";

type Context = { params: Promise<{ resource: string }> };

export async function GET(request: Request, context: Context) {
  const { resource } = await context.params;
  if (
    !financeResources.includes(
      resource as (typeof financeResources)[number],
    )
  ) {
    return NextResponse.json(
      { message: "Unsupported Finance & Billing resource." },
      { status: 404 },
    );
  }
  return proxyAdminRequest(request, `/finance/${resource}/options`);
}

