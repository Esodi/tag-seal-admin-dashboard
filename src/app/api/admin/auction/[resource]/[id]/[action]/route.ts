import { proxyAdminRequest } from "@/lib/auth/admin-proxy";

type Context = { params: Promise<{ resource: string; id: string; action: string }> };

const allowed: Record<string, Record<string, string[]>> = {
  centres: { members: ["GET", "POST"] },
  officers: { approve: ["POST"], reject: ["POST"] },
  sessions: { cancel: ["POST"], republish: ["POST"] },
  intakes: { review: ["POST"], "approve-return": ["POST"] },
  sales: { "mark-paid": ["POST"] },
};

async function forward(request: Request, { params }: Context) {
  const { resource, id, action } = await params;
  if (!allowed[resource]?.[action]?.includes(request.method)) return Response.json({ message: "Unsupported auction action." }, { status: 404 });
  return proxyAdminRequest(request, `/auction/${resource}/${encodeURIComponent(id)}/${action}`);
}

export { forward as GET, forward as POST };
