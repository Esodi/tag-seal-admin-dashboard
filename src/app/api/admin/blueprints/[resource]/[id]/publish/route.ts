import { NextResponse } from "next/server";
import { blueprintResources } from "@/features/blueprints/types";
import { proxyAdminRequest } from "@/lib/auth/admin-proxy";

type Context = { params: Promise<{ resource: string; id: string }> };

function valid(resource: string) {
  return blueprintResources.includes(
    resource as (typeof blueprintResources)[number],
  );
}

export async function POST(request: Request, context: Context) {
  const { resource, id } = await context.params;
  if (!valid(resource)) {
    return NextResponse.json(
      { message: "Unsupported Blueprint Engine resource." },
      { status: 404 },
    );
  }
  return proxyAdminRequest(request, `/blueprints/${resource}/${id}/publish`);
}

