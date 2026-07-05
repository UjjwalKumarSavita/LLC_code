import { NextResponse } from "next/server";
import {
  authenticatedBackendFetch,
  clearAuthCookies,
  setAuthCookies,
} from "@/lib/server/backend-auth";

export async function GET() {
  try {
    const { response: backendResponse, rotatedTokens } =
      await authenticatedBackendFetch("/progress");
    const body = await backendResponse.text();
    const response = new NextResponse(body || null, {
      status: backendResponse.status,
      headers: {
        "Content-Type":
          backendResponse.headers.get("content-type") ?? "application/json",
      },
    });
    if (rotatedTokens) setAuthCookies(response, rotatedTokens);
    if (backendResponse.status === 401) clearAuthCookies(response);
    return response;
  } catch {
    return NextResponse.json(
      { message: "Progress service is unavailable" },
      { status: 503 },
    );
  }
}
