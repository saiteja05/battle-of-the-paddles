import { requireOperator } from "@/lib/auth";
import { roundSnapshot } from "@/lib/bracket";
import { errorResponse, json } from "@/lib/http";
import { applyGenerate } from "@/lib/ops";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    await requireOperator(req);
    const body = (await req.json().catch(() => ({}))) as {
      mode?: "seeded" | "chaos";
      includeUnchecked?: boolean;
    };
    const store = await getStore();
    const event = await store.update((t) =>
      applyGenerate(t, {
        mode: body.mode === "chaos" ? "chaos" : "seeded",
        includeUnchecked: Boolean(body.includeUnchecked),
      }),
    );
    return json({
      event,
      store: store.backend,
      rounds: roundSnapshot(event.matches),
    });
  } catch (err) {
    return errorResponse(err);
  }
}
