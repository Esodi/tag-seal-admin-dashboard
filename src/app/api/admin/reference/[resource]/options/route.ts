import { NextResponse } from "next/server";
import { referenceResources } from "@/features/reference/types";
import { proxyAdminRequest } from "@/lib/auth/admin-proxy";

type Context = { params: Promise<{ resource: string }> };

export async function GET(request: Request, context: Context) {
  const { resource } = await context.params;
  if (
    !referenceResources.includes(
      resource as (typeof referenceResources)[number],
    )
  ) {
    return NextResponse.json(
      { message: "Unsupported Reference Master Data resource." },
      { status: 404 },
    );
  }
  return proxyAdminRequest(request, `/reference/${resource}/options`);
}
