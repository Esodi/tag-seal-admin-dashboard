import { NextResponse } from "next/server";
import { proxyAdminRequest } from "@/lib/auth/admin-proxy";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  const { id } = await context.params;
  if (!/^\d+$/.test(id)) return NextResponse.json({ message: "Unknown account." }, { status: 404 });
  return proxyAdminRequest(request, `/users/${id}/phone`);
}
