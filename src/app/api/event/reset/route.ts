import { requireOperator } from "@/lib/auth";
import { errorResponse, json } from "@/lib/http";
import { applyReset } from "@/lib/ops";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    await requireOperator(req);
    const body = (await req.json().catch(() => ({}))) as { keepPlayers?: boolean };
    const store = await getStore();
    const event = await store.update((t) => applyReset(t, body.keepPlayers !== false));
    return json({ event });
  } catch (err) {
    return errorResponse(err);
  }
}
