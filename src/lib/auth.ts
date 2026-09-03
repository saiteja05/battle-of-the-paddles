import { cookies } from "next/headers";

export const PIN_COOKIE = "botp_pin";

export function expectedPin(): string {
  return process.env.OPERATOR_PIN || "0909";
}

export async function readPinFromRequest(req: Request): Promise<string | null> {
  const header = req.headers.get("x-operator-pin");
  if (header) return header.trim();
  const jar = await cookies();
  return jar.get(PIN_COOKIE)?.value ?? null;
}

export async function requireOperator(req: Request): Promise<void> {
  const pin = await readPinFromRequest(req);
  if (!pin || pin !== expectedPin()) {
    const err = new Error("Unauthorized");
    (err as Error & { status: number }).status = 401;
    throw err;
  }
}

export function isValidPin(pin: string): boolean {
  return pin.trim() === expectedPin();
}
