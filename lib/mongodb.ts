import "server-only";

import { MongoClient, ServerApiVersion, type Db } from "mongodb";

const globalForMongo = globalThis as unknown as {
  mongoClientPromise?: Promise<MongoClient>;
};

/** Atlas-friendly defaults: bounded pool, idle cleanup, stable API surface. */
function clientOptions() {
  return {
    maxPoolSize: 10,
    minPoolSize: 0,
    maxIdleTimeMS: 60_000,
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  } as const;
}

function clientPromise(uri: string): Promise<MongoClient> {
  if (!globalForMongo.mongoClientPromise) {
    globalForMongo.mongoClientPromise = new MongoClient(uri, clientOptions()).connect();
  }
  return globalForMongo.mongoClientPromise;
}

export async function getMongoDb(): Promise<Db> {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }
  const client = await clientPromise(uri);
  const name = process.env.MONGODB_DB?.trim() || "picklespot";
  return client.db(name);
}

export async function getCourtsCollection() {
  const db = await getMongoDb();
  const name = process.env.MONGODB_COLLECTION?.trim() || "courts";
  return db.collection(name);
}
