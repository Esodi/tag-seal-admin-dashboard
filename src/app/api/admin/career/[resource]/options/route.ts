import { NextResponse } from "next/server";
import { careerResources } from "@/features/career/types";
import { proxyAdminRequest } from "@/lib/auth/admin-proxy";
export async function GET(
  request: Request,
  context: { params: Promise<{ resource: string }> },
) {
  const { resource } = await context.params;
  if (!careerResources.includes(resource as (typeof careerResources)[number]))
    return NextResponse.json(
      { message: "Resource not found." },
      { status: 404 },
    );
  return proxyAdminRequest(request, `/career/${resource}/options`);
}
