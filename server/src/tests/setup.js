import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

// Prefer system binary if available to avoid external download
if (!process.env.MONGOMS_SYSTEM_BINARY) {
  process.env.MONGOMS_SYSTEM_BINARY = '/opt/homebrew/bin/mongod';
}

let mongoServer;

export async function connectTestDB() {
  mongoServer = await MongoMemoryServer.create({
    instance: {
      dbName: 'school_test_db',
    },
  });
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  return uri;
}

export async function clearTestDB() {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
}

export async function closeTestDB() {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
}
