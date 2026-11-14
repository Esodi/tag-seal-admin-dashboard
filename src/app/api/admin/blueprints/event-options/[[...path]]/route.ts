import { NextResponse } from "next/server";
import { proxyAdminRequest } from "@/lib/auth/admin-proxy";

type Context = { params: Promise<{ path?: string[] }> };

const UUID = /^[0-9a-f-]{36}$/i;

function valid(path: string[]) {
  const [list, options, option, ...rest] = path;
  if (rest.length) return false;
  if (list === undefined) return true;
  if (!UUID.test(list)) return false;
  if (options === undefined) return true;
  if (options !== "options") return false;
  return option === undefined || option === "order" || UUID.test(option);
}

async function proxy(request: Request, context: Context) {
  const { path = [] } = await context.params;
  if (!valid(path)) {
    return NextResponse.json({ message: "Unsupported option list request." }, { status: 404 });
  }
  return proxyAdminRequest(request, ["/blueprints/event-options", ...path].join("/"));
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
