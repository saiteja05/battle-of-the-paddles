import { requireOperator } from "@/lib/auth";
import { errorResponse, json } from "@/lib/http";
import { applyImport } from "@/lib/ops";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

async function readCsv(req: Request): Promise<string> {
  const ct = req.headers.get("content-type") || "";
  if (ct.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("file");
    if (file instanceof File) return file.text();
    const csv = form.get("csv");
    if (typeof csv === "string") return csv;
  }
  return req.text();
}

export async function POST(req: Request) {
  try {
    await requireOperator(req);
    const csv = await readCsv(req);
    if (!csv.trim()) return json({ error: "Empty CSV" }, 400);
    const store = await getStore();
    const event = await store.update((t) => applyImport(t, csv));
    return json({ event, stats: event.importStats });
  } catch (err) {
    return errorResponse(err);
  }
}
