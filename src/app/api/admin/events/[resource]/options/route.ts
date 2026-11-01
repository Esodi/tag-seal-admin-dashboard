import { NextResponse } from "next/server";
import { eventResources } from "@/features/events/types";
import { proxyAdminRequest } from "@/lib/auth/admin-proxy";

type Context = { params: Promise<{ resource: string }> };

export async function GET(request: Request, context: Context) {
  const { resource } = await context.params;
  if (
    !eventResources.includes(
      resource as (typeof eventResources)[number],
    )
  ) {
    return NextResponse.json(
      { message: "Unsupported Events & Logs resource." },
      { status: 404 },
    );
  }
  return proxyAdminRequest(request, `/events/${resource}/options`);
}

