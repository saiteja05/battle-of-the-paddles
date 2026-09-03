import { getStore } from "@/lib/store";
import { errorResponse, json } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const store = await getStore();
    const event = await store.load();
    return json({ ...event, store: store.backend });
  } catch (err) {
    return errorResponse(err);
  }
}
