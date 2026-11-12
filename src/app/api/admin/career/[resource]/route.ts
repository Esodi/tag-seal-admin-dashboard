import { NextResponse } from "next/server";
import { careerResources } from "@/features/career/types";
import { proxyAdminRequest } from "@/lib/auth/admin-proxy";
type Context = { params: Promise<{ resource: string }> };
async function proxy(request: Request, context: Context) {
  const { resource } = await context.params;
  if (
    resource !== "overview" &&
    !careerResources.includes(resource as (typeof careerResources)[number])
  )
    return NextResponse.json(
      { message: "Unsupported Career resource." },
      { status: 404 },
    );
  return proxyAdminRequest(request, `/career/${resource}`);
}
export const GET = proxy;
export const POST = proxy;
