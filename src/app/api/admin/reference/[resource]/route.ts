import { NextResponse } from "next/server";
import { referenceResources } from "@/features/reference/types";
import { proxyAdminRequest } from "@/lib/auth/admin-proxy";

type Context = { params: Promise<{ resource: string }> };

function valid(resource: string) {
  return referenceResources.includes(
    resource as (typeof referenceResources)[number],
  );
}

async function proxy(request: Request, context: Context) {
  const { resource } = await context.params;
  if (!valid(resource)) {
    return NextResponse.json(
      { message: "Unsupported Reference Master Data resource." },
      { status: 404 },
    );
  }
  return proxyAdminRequest(request, `/reference/${resource}`);
}

export const GET = proxy;
export const POST = proxy;
