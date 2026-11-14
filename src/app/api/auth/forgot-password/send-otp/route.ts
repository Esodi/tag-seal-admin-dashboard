import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({ login: z.string().trim().min(1) });
const apiUrl = process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8000";

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: "Enter your username or email." }, { status: 422 });
  }

  try {
    const upstream = await fetch(`${apiUrl}/api/auth/forgot-password/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", "X-App-Version": "2.0.0" },
      body: JSON.stringify({ login: parsed.data.login }),
      cache: "no-store",
    });
    const payload = await upstream.json().catch(() => ({ message: "Could not send the verification code." }));
    if (!upstream.ok) {
      return NextResponse.json(
        { message: payload.message ?? "Could not send the verification code.", errors: payload.errors },
        { status: upstream.status || 400 },
      );
    }
    return NextResponse.json({
      message: payload.message,
      expiresAt: payload.data?.expiresAt,
      expiresInSeconds: payload.data?.expiresInSeconds ?? 300,
      phoneHint: payload.data?.phoneHint,
      email: payload.data?.email,
    });
  } catch {
    return NextResponse.json({ message: "The authentication service is unavailable." }, { status: 503 });
  }
}
