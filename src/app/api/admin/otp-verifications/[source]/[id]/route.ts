import { proxyAdminRequest } from "@/lib/auth/admin-proxy";
import { NextResponse } from "next/server";

export async function DELETE(request: Request, { params }: { params: Promise<{ source: string; id: string }> }) {
  const { source, id } = await params;
  if (!["phone", "legacy"].includes(source) || !/^\d+$/.test(id)) {
    return NextResponse.json({ message: "OTP record not found." }, { status: 404 });
  }
  return proxyAdminRequest(request, `/otp-verifications/${source}/${id}`);
}
