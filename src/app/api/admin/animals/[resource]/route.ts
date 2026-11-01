import { NextResponse } from "next/server";
import { animalResources } from "@/features/animals/types";
import { proxyAdminRequest } from "@/lib/auth/admin-proxy";

type Context = { params: Promise<{ resource: string }> };

function valid(resource: string) {
  return animalResources.includes(
    resource as (typeof animalResources)[number],
  );
}

async function proxy(request: Request, context: Context) {
  const { resource } = await context.params;
  if (!valid(resource)) {
    return NextResponse.json(
      { message: "Unsupported Animals & Livestock resource." },
      { status: 404 },
    );
  }
  return proxyAdminRequest(request, `/animals/${resource}`);
}

export const GET = proxy;
export const POST = proxy;

