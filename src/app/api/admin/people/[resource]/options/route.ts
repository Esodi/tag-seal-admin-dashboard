import { NextResponse } from "next/server";
import { peopleResources } from "@/features/people/types";
import { proxyAdminRequest } from "@/lib/auth/admin-proxy";

type Context = { params: Promise<{ resource: string }> };

export async function GET(request: Request, context: Context) {
  const { resource } = await context.params;
  if (!peopleResources.includes(resource as (typeof peopleResources)[number])) {
    return NextResponse.json({ message: "Unsupported People & Organization resource." }, { status: 404 });
  }
  return proxyAdminRequest(request, `/people/${resource}/options`);
}
