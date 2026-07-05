import { NextResponse } from "next/server";
import type { AuthPayload } from "@/lib/auth-types";
import { backendUrl, setAuthCookies } from "@/lib/server/backend-auth";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const backendResponse = await fetch(backendUrl("/auth/login"), {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body,
    });
    const data = (await backendResponse.json()) as AuthPayload | { message: string };
    if (!backendResponse.ok) {
      return NextResponse.json(data, { status: backendResponse.status });
    }

    const payload = data as AuthPayload;
    const response = NextResponse.json({ user: payload.user });
    setAuthCookies(response, payload);
    return response;
  } catch {
    return NextResponse.json(
      { message: "Authentication service is unavailable" },
      { status: 503 },
    );
  }
}
