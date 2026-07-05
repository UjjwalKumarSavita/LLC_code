import { NextRequest, NextResponse } from "next/server";
import {
  authenticatedBackendFetch,
  clearAuthCookies,
  setAuthCookies
} from "@/lib/server/backend-auth";

type RouteContext = {
  params: Promise<{ path?: string[] }>;
};

async function proxyRequest(request: NextRequest, context: RouteContext) {
  const { path = [] } = await context.params;
  const allowed =
    path.length === 0 ||
    (path.length === 1 &&
      (path[0] === "run" ||
        path[0] === "submit" ||
        /^[0-9a-f-]{36}$/i.test(path[0])));
  if (!allowed) {
    return NextResponse.json(
      { message: "Unsupported submission resource" },
      { status: 404 }
    );
  }

  const suffix = path.length
    ? `/${path.map(encodeURIComponent).join("/")}`
    : "";
  const backendPath = `/submissions${suffix}${request.nextUrl.search}`;
  const body = request.method === "GET" ? undefined : await request.text();

  try {
    const { response: backendResponse, rotatedTokens } =
      await authenticatedBackendFetch(backendPath, {
        method: request.method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body
      });
    const responseBody = await backendResponse.text();
    const response = new NextResponse(responseBody || null, {
      status: backendResponse.status,
      headers: {
        "Content-Type":
          backendResponse.headers.get("content-type") ?? "application/json"
      }
    });
    if (rotatedTokens) setAuthCookies(response, rotatedTokens);
    if (backendResponse.status === 401) clearAuthCookies(response);
    return response;
  } catch {
    return NextResponse.json(
      { message: "Submission service is unavailable" },
      { status: 503 }
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
