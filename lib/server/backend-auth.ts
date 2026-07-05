import "server-only";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth-constants";
import type { AuthPayload } from "@/lib/auth-types";

export { ACCESS_COOKIE, REFRESH_COOKIE };

const API_BASE_URL =
  process.env.API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:4000/api";

type TokenPair = Pick<
  AuthPayload,
  "accessToken" | "refreshToken" | "expiresIn"
>;

export function backendUrl(path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalized}`;
}

export function setAuthCookies(response: NextResponse, tokens: TokenPair) {
  const secure = process.env.NODE_ENV === "production";
  response.cookies.set(ACCESS_COOKIE, tokens.accessToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: parseDurationSeconds(tokens.expiresIn, 15 * 60),
  });
  response.cookies.set(REFRESH_COOKIE, tokens.refreshToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set(ACCESS_COOKIE, "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });
  response.cookies.set(REFRESH_COOKIE, "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });
}

export async function authenticatedBackendFetch(
  path: string,
  init: RequestInit = {},
) {
  const cookieStore = await cookies();
  let accessToken = cookieStore.get(ACCESS_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;
  let rotatedTokens: TokenPair | undefined;

  if (!accessToken && refreshToken) {
    rotatedTokens = await rotateTokens(refreshToken);
    accessToken = rotatedTokens?.accessToken;
  }

  if (!accessToken) {
    return {
      response: Response.json({ message: "Authentication required" }, { status: 401 }),
      rotatedTokens,
    };
  }

  let response = await fetch(backendUrl(path), {
    ...init,
    cache: "no-store",
    headers: {
      ...headersToObject(init.headers),
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status === 401 && refreshToken) {
    rotatedTokens = await rotateTokens(refreshToken);
    if (rotatedTokens) {
      response = await fetch(backendUrl(path), {
        ...init,
        cache: "no-store",
        headers: {
          ...headersToObject(init.headers),
          Authorization: `Bearer ${rotatedTokens.accessToken}`,
        },
      });
    }
  }

  return { response, rotatedTokens };
}

async function rotateTokens(refreshToken: string): Promise<TokenPair | undefined> {
  const response = await fetch(backendUrl("/auth/refresh"), {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!response.ok) return undefined;
  return (await response.json()) as TokenPair;
}

function headersToObject(headers: HeadersInit | undefined) {
  return Object.fromEntries(new Headers(headers).entries());
}

function parseDurationSeconds(value: string, fallback: number) {
  const match = /^(\d+)(s|m|h|d)$/.exec(value);
  if (!match) return fallback;
  const amount = Number(match[1]);
  const multiplier = { s: 1, m: 60, h: 3600, d: 86400 }[
    match[2] as "s" | "m" | "h" | "d"
  ];
  return amount * multiplier;
}
