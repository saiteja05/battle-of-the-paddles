import { requireOperator } from "@/lib/auth";
import { roundSnapshot } from "@/lib/bracket";
import { errorResponse, json } from "@/lib/http";
import { applySetWinner } from "@/lib/ops";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(req: Request, ctx: { params: Promise<{ matchId: string }> }) {
  try {
    await requireOperator(req);
    const { matchId } = await ctx.params;
    const body = (await req.json()) as { winnerId?: string };
    if (!body.winnerId) return json({ error: "winnerId required" }, 400);
    const store = await getStore();
    const event = await store.update((t) => applySetWinner(t, decodeURIComponent(matchId), body.winnerId!));
    return json({
      event,
      store: store.backend,
      rounds: roundSnapshot(event.matches),
    });
  } catch (err) {
    return errorResponse(err);
  }
}
