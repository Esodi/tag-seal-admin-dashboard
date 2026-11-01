import { proxyAdminRequest } from "@/lib/auth/admin-proxy";

type Context = { params: Promise<{ id: string }> };
export async function GET(request: Request, context: Context) { const { id } = await context.params; return proxyAdminRequest(request, `/users/${id}`); }
export async function PATCH(request: Request, context: Context) { const { id } = await context.params; return proxyAdminRequest(request, `/users/${id}`); }
export async function DELETE(request: Request, context: Context) { const { id } = await context.params; return proxyAdminRequest(request, `/users/${id}`); }
