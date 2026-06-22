import mongoose from "mongoose";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const globalWithMongoose = global as typeof globalThis & {
  mongooseCache?: MongooseCache;
};

let cache = globalWithMongoose.mongooseCache;

if (!cache) {
  cache = { conn: null, promise: null };
  globalWithMongoose.mongooseCache = cache;
}

export async function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Missing MONGODB_URI environment variable");
  }

  if (cache!.conn) {
    return cache!.conn;
  }

  if (!cache!.promise) {
    cache!.promise = mongoose.connect(uri, {
      bufferCommands: false,
    });
  }

  cache!.conn = await cache!.promise;
  return cache!.conn;
}
