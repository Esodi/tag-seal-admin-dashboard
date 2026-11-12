import { NextResponse } from "next/server";
import { careerResources } from "@/features/career/types";
import { proxyAdminRequest } from "@/lib/auth/admin-proxy";
type Context = { params: Promise<{ resource: string; id: string }> };
async function proxy(request: Request, context: Context) {
  const { resource, id } = await context.params;
  if (
    !careerResources.includes(resource as (typeof careerResources)[number]) ||
    !/^\d+$/.test(id)
  )
    return NextResponse.json({ message: "Record not found." }, { status: 404 });
  return proxyAdminRequest(request, `/career/${resource}/${id}`);
}
export const GET = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
