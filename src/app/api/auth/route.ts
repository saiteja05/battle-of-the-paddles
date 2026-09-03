import { NextResponse } from "next/server";
import { expectedPin, isValidPin, PIN_COOKIE } from "@/lib/auth";
import { cookies } from "next/headers";
import { errorResponse, json } from "@/lib/http";

export async function GET() {
  const jar = await cookies();
  const pin = jar.get(PIN_COOKIE)?.value ?? "";
  return json({ ok: isValidPin(pin), configured: Boolean(expectedPin()) });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { pin?: string };
    const pin = String(body.pin || "");
    if (!isValidPin(pin)) return json({ ok: false, error: "Wrong PIN" }, 401);
    const res = NextResponse.json({ ok: true });
    res.cookies.set(PIN_COOKIE, pin, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (err) {
    return errorResponse(err);
  }
}
