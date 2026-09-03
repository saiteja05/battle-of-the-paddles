import { requireOperator } from "@/lib/auth";
import { errorResponse, json } from "@/lib/http";
import { applyUndo } from "@/lib/ops";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(req: Request, ctx: { params: Promise<{ matchId: string }> }) {
  try {
    await requireOperator(req);
    const { matchId } = await ctx.params;
    const store = await getStore();
    const event = await store.update((t) => applyUndo(t, decodeURIComponent(matchId)));
    return json({ event });
  } catch (err) {
    return errorResponse(err);
  }
}
