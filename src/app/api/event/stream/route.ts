import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const store = await getStore();
  let last = -1;
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      let stopped = false;
      const send = async () => {
        if (stopped) return;
        try {
          const t = await store.load();
          if (t.revision !== last) {
            last = t.revision;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(t)}\n\n`));
          } else {
            controller.enqueue(encoder.encode(`: ping\n\n`));
          }
        } catch {
          /* keep polling */
        }
      };
      const iv = setInterval(send, 1000);
      void send();
      req.signal.addEventListener("abort", () => {
        stopped = true;
        clearInterval(iv);
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      });
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
