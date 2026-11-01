import { NextResponse } from "next/server";
import { animalResources } from "@/features/animals/types";
import { proxyAdminRequest } from "@/lib/auth/admin-proxy";

type Context = { params: Promise<{ resource: string }> };

export async function GET(request: Request, context: Context) {
  const { resource } = await context.params;
  if (
    !animalResources.includes(
      resource as (typeof animalResources)[number],
    )
  ) {
    return NextResponse.json(
      { message: "Unsupported Animals & Livestock resource." },
      { status: 404 },
    );
  }
  return proxyAdminRequest(request, `/animals/${resource}/options`);
}

