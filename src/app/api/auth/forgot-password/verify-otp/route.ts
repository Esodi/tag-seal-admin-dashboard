import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  login: z.string().trim().min(1),
  otp: z.string().trim().length(6),
});
const apiUrl = process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8000";

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: "Enter the 6-digit verification code." }, { status: 422 });
  }

  try {
    const upstream = await fetch(`${apiUrl}/api/auth/forgot-password/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", "X-App-Version": "2.0.0" },
      body: JSON.stringify(parsed.data),
      cache: "no-store",
    });
    const payload = await upstream.json().catch(() => ({ message: "Could not verify the code." }));
    if (!upstream.ok) {
      return NextResponse.json(
        { message: payload.message ?? "Could not verify the code.", errors: payload.errors },
        { status: upstream.status || 400 },
      );
    }
    return NextResponse.json({ message: payload.message ?? "OTP verified successfully." });
  } catch {
    return NextResponse.json({ message: "The authentication service is unavailable." }, { status: 503 });
  }
}
