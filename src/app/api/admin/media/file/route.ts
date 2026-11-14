import { proxyAdminFile } from "@/lib/auth/admin-file-proxy";

export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get("key") ?? "";
  if (!key || key.length > 255 || key.includes("..")) {
    return Response.json({ message: "Unsupported media key." }, { status: 404 });
  }
  return proxyAdminFile(`/media/file?key=${encodeURIComponent(key)}`);
}
