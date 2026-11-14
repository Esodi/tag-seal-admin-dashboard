import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  login: z.string().trim().min(1),
  otp: z.string().trim().length(6),
  newPassword: z.string().min(8),
  newPassword_confirmation: z.string().min(8),
}).refine((value) => value.newPassword === value.newPassword_confirmation, {
  message: "Passwords do not match.",
  path: ["newPassword_confirmation"],
});
const apiUrl = process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8000";

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Check the new password and confirmation.";
    return NextResponse.json({ message }, { status: 422 });
  }

  try {
    const upstream = await fetch(`${apiUrl}/api/auth/forgot-password/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", "X-App-Version": "2.0.0" },
      body: JSON.stringify(parsed.data),
      cache: "no-store",
    });
    const payload = await upstream.json().catch(() => ({ message: "Could not reset the password." }));
    if (!upstream.ok) {
      return NextResponse.json(
        { message: payload.message ?? "Could not reset the password.", errors: payload.errors },
        { status: upstream.status || 400 },
      );
    }
    return NextResponse.json({ message: payload.message ?? "Password reset successfully." });
  } catch {
    return NextResponse.json({ message: "The authentication service is unavailable." }, { status: 503 });
  }
}
