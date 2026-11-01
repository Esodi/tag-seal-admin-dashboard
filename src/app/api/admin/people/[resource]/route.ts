import { NextResponse } from "next/server";
import { peopleResources } from "@/features/people/types";
import { proxyAdminRequest } from "@/lib/auth/admin-proxy";

type Context = { params: Promise<{ resource: string }> };

function valid(resource: string) {
  return peopleResources.includes(resource as (typeof peopleResources)[number]);
}

async function proxy(request: Request, context: Context) {
  const { resource } = await context.params;
  if (!valid(resource)) return NextResponse.json({ message: "Unsupported People & Organization resource." }, { status: 404 });
  return proxyAdminRequest(request, `/people/${resource}`);
}

export const GET = proxy;
export const POST = proxy;
