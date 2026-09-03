/** True when built for GitHub Pages (no Node API routes). */
export const isStaticHosting =
  process.env.NEXT_PUBLIC_STATIC_HOSTING === "1" || process.env.NEXT_PUBLIC_STATIC_HOSTING === "true";

export function expectedPinPublic(): string {
  return process.env.NEXT_PUBLIC_OPERATOR_PIN || "0909";
}

export const STORAGE_KEY = "battle-of-the-paddles-tournament";
export const AUTH_KEY = "botp_authed";
