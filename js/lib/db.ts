import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

const uri: string = process.env.MONGODB_URI;

export async function connectMongoClient() {
  const client: MongoClient = new MongoClient(uri);
  await client.connect();

  console.log('Connected to MongoDB');
  return client;
}
