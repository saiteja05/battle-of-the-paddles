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

async function tryMongo(): Promise<Store | null> {
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 2500 });
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
  const col: Collection<Tournament> = db.collection("tournaments");
  return {
    backend: "mongo",
    async load() {
      const doc = await col.findOne({ _id: TOURNAMENT_ID } as never);
      return (doc as Tournament | null) ?? createEmptyTournament();
    },
    async save(t) {
      await col.replaceOne({ _id: TOURNAMENT_ID } as never, t, { upsert: true });
    },
    async update(mutator) {
      const current = ((await col.findOne({ _id: TOURNAMENT_ID } as never)) as Tournament | null) ?? createEmptyTournament();
      const next = mutator(clone(current));
      await col.replaceOne({ _id: TOURNAMENT_ID } as never, next, { upsert: true });
      return next;
    },
  };
}

let cached: Promise<Store> | null = null;

export async function getStore(): Promise<Store> {
  if (!cached) {
    cached = (async () => {
      const mode = (process.env.STORE || "auto").toLowerCase();
      if (mode === "file") {
        console.log("[store] file backend (STORE=file)");
        return fileStore();
      }
      if (mode !== "mongo") {
        const mongo = await tryMongo();
        if (mongo) {
          console.log("[store] mongo backend");
          return mongo;
        }
        console.log("[store] mongo unavailable — using data/tournament.json");
        return fileStore();
      }
      const mongo = await tryMongo();
      if (!mongo) throw new Error("STORE=mongo but MongoDB is unreachable");
      console.log("[store] mongo backend");
      return mongo;
    })();
  }
  return cached;
}

export function resetStoreCache() {
  cached = null;
}
