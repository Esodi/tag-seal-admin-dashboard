import { NextResponse } from "next/server";
import { animalResources } from "@/features/animals/types";
import { proxyAdminRequest } from "@/lib/auth/admin-proxy";

type Context = { params: Promise<{ resource: string; id: string }> };

async function proxy(request: Request, context: Context) {
  const { resource, id } = await context.params;
  if (
    !animalResources.includes(
      resource as (typeof animalResources)[number],
    ) ||
    !/^\d+$/.test(id)
  ) {
    return NextResponse.json(
      { message: "Unsupported Animals & Livestock record." },
      { status: 404 },
    );
  }
  return proxyAdminRequest(request, `/animals/${resource}/${id}`);
}

export const GET = proxy;
export const PATCH = proxy;
export const DELETE = proxy;

