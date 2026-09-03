import { NextResponse } from "next/server";

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function errorResponse(err: unknown) {
  const message = err instanceof Error ? err.message : "Server error";
  const status = (err as { status?: number }).status ?? (message === "Unauthorized" ? 401 : 400);
  return json({ error: message }, status);
}
