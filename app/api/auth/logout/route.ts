import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { backendUrl, clearAuthCookies, REFRESH_COOKIE } from "@/lib/server/backend-auth";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;

  if (refreshToken) {
    try {
      await fetch(backendUrl("/auth/logout"), {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // Local cookies are still cleared when the API is temporarily offline.
    }
  }

  const response = NextResponse.json({ success: true });
  clearAuthCookies(response);
  return response;
}
