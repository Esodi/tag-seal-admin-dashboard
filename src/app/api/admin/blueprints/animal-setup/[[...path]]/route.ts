import { NextResponse } from "next/server";
import { proxyAdminRequest } from "@/lib/auth/admin-proxy";

type Context = { params: Promise<{ path?: string[] }> };

const ACTIONS = ["events", "publish", "new-version", "live", "pause"];

function valid(path: string[]) {
  const [type, action, event, ...rest] = path;
  if (rest.length) return false;
  if (type === undefined) return true;
  if (!/^\d+$/.test(type)) return false;
  if (action === undefined) return true;
  if (!ACTIONS.includes(action)) return false;
  return event === undefined || (action === "events" && /^[0-9a-f-]{36}$/i.test(event));
}

async function proxy(request: Request, context: Context) {
  const { path = [] } = await context.params;
  if (!valid(path)) {
    return NextResponse.json({ message: "Unsupported animal setup request." }, { status: 404 });
  }
  return proxyAdminRequest(request, ["/blueprints/animal-setup", ...path].join("/"));
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
