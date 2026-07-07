import "server-only";

import type { LeaderboardResponse } from "@/lib/leaderboard-types";

const API_BASE_URL =
  process.env.API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:4000/api";

export async function getLeaderboard(): Promise<LeaderboardResponse> {
  const response = await fetch(`${API_BASE_URL}/leaderboard`, {
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Leaderboard service is unavailable");
  return (await response.json()) as LeaderboardResponse;
}
