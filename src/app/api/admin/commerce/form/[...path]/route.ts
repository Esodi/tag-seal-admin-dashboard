import { proxyAdminRequest } from "@/lib/auth/admin-proxy";

const lookups = [/^people$/, /^holdable-livestock$/, /^open-listings$/, /^farms\/[^/]+\/livestock$/];

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const path = (await params).path.map(encodeURIComponent).join("/");
  if (!lookups.some((pattern) => pattern.test(path))) return Response.json({ message: "Unsupported commerce lookup." }, { status: 404 });
  return proxyAdminRequest(request, `/commerce/form/${path}`);
}
