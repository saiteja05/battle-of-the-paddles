import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { MongoClient, type Collection, type Db } from "mongodb";
import { createEmptyTournament } from "./bracket";
import { TOURNAMENT_ID, type Tournament } from "./types";

export interface Store {
  backend: "mongo" | "file";
  load(): Promise<Tournament>;
  save(t: Tournament): Promise<void>;
  update(mutator: (t: Tournament) => Tournament): Promise<Tournament>;
}

const FILE_PATH = path.join(process.cwd(), "data", "tournament.json");
const COLLECTION = "tournaments";

let chain: Promise<unknown> = Promise.resolve();
function serialize<T>(fn: () => Promise<T>): Promise<T> {
  const next = chain.then(fn, fn);
  chain = next.then(
    () => undefined,
    () => undefined,
  );
  return next;
}

function clone(t: Tournament): Tournament {
  return structuredClone(t);
}

function fileStore(): Store {
  async function read(): Promise<Tournament> {
    try {
      const raw = await readFile(FILE_PATH, "utf8");
      return JSON.parse(raw) as Tournament;
    } catch {
      return createEmptyTournament();
    }
  }
  return {
    backend: "file",
    load: () => serialize(read),
    save: (t) =>
      serialize(async () => {
        await mkdir(path.dirname(FILE_PATH), { recursive: true });
        await writeFile(FILE_PATH, JSON.stringify(t, null, 2));
      }),
    update: (mutator) =>
      serialize(async () => {
        const current = await read();
        const next = mutator(clone(current));
        await mkdir(path.dirname(FILE_PATH), { recursive: true });
        await writeFile(FILE_PATH, JSON.stringify(next, null, 2));
        return next;
      }),
  };
}

/**
 * Same document shape as Atlas at the venue: one `tournaments` doc with
 * `_id: "battle-of-the-paddles"`. Two operators share this record.
 */
function mongoStore(col: Collection<Tournament>): Store {
  const idFilter = { _id: TOURNAMENT_ID } as never;
  return {
    backend: "mongo",
    load: () =>
      serialize(async () => {
        const doc = await col.findOne(idFilter);
        return (doc as Tournament | null) ?? createEmptyTournament();
      }),
    save: (t) =>
      serialize(async () => {
        await col.replaceOne(idFilter, t, { upsert: true });
      }),
    update: (mutator) =>
      serialize(async () => {
        const existing = (await col.findOne(idFilter)) as Tournament | null;
        const current = existing ?? createEmptyTournament();
        const next = mutator(clone(current));
        if (!existing) {
          await col.replaceOne(idFilter, next, { upsert: true });
          return next;
        }
        const result = await col.replaceOne({ _id: TOURNAMENT_ID, revision: existing.revision } as never, next);
        if (result.matchedCount === 0) {
          throw new Error("The other board already saved a change — refresh and tap again");
        }
        return next;
      }),
  };
}

async function tryMongo(): Promise<Store | null> {
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 10000,
    maxPoolSize: 8,
  });
  try {
    await client.connect();
    await client.db().admin().command({ ping: 1 });
  } catch {
    try {
      await client.close();
    } catch {
      /* ignore */
    }
    return null;
  }
  const db: Db = client.db();
  const col: Collection<Tournament> = db.collection(COLLECTION);
  return mongoStore(col);
}

let cached: Promise<Store> | null = null;

export async function getStore(): Promise<Store> {
  if (!cached) {
    cached = (async () => {
      const mode = (process.env.STORE || "auto").toLowerCase();
      if (mode === "file") {
        console.log("[store] file backend (STORE=file) — fallback only");
        return fileStore();
      }
      if (mode !== "mongo") {
        const mongo = await tryMongo();
        if (mongo) {
          console.log(`[store] mongo backend · ${COLLECTION}._id=${TOURNAMENT_ID}`);
          return mongo;
        }
        console.log("[store] mongo unavailable — falling back to data/tournament.json");
        return fileStore();
      }
      const mongo = await tryMongo();
      if (!mongo) throw new Error("STORE=mongo but MongoDB is unreachable");
      console.log(`[store] mongo backend · ${COLLECTION}._id=${TOURNAMENT_ID}`);
      return mongo;
    })();
  }
  return cached;
}

export function resetStoreCache() {
  cached = null;
}
