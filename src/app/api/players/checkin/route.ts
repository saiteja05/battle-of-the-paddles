import { requireOperator } from "@/lib/auth";
import { errorResponse, json } from "@/lib/http";
import { applyCheckin, applyLateCheckin } from "@/lib/ops";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    await requireOperator(req);
    const body = (await req.json()) as { playerId?: string; checkedIn?: boolean; late?: boolean };
    if (!body.playerId) return json({ error: "playerId required" }, 400);
    const store = await getStore();
    const event = await store.update((t) => {
      if (body.late) return applyLateCheckin(t, body.playerId!);
      return applyCheckin(t, body.playerId!, body.checkedIn !== false);
    });
    return json({ event });
  } catch (err) {
    return errorResponse(err);
  }
}
