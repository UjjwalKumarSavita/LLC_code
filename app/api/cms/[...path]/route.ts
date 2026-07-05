import { NextRequest, NextResponse } from "next/server";
import { authenticatedBackendFetch, clearAuthCookies, setAuthCookies } from "@/lib/server/backend-auth";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

async function proxyRequest(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  if (
    !path.length ||
    !["problems", "editorials"].includes(path[0])
  ) {
    return NextResponse.json({ message: "Unsupported CMS resource" }, { status: 404 });
  }

  const backendPath = `/${path.map(encodeURIComponent).join("/")}${request.nextUrl.search}`;
  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.text();

  try {
    const { response: backendResponse, rotatedTokens } =
      await authenticatedBackendFetch(backendPath, {
        method: request.method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body,
      });
    const responseBody = await backendResponse.text();
    const response = new NextResponse(responseBody || null, {
      status: backendResponse.status,
      headers: {
        "Content-Type": backendResponse.headers.get("content-type") ?? "application/json",
      },
    });
    if (rotatedTokens) setAuthCookies(response, rotatedTokens);
    if (backendResponse.status === 401) clearAuthCookies(response);
    return response;
  } catch {
    return NextResponse.json(
      { message: "CMS API is unavailable" },
      { status: 503 },
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
