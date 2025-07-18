
'use server';
import clientPromise from '@/lib/mongodb';
import { v4 as uuidv4 } from 'uuid';
import type { ApiKey } from '@/lib/types';
import { ObjectId } from 'mongodb';


async function getApiKeyCollection() {
    const client = await clientPromise;
    const db = client.db("oriango");
    // This assumes your collection is named 'api_keys'.
    // The type parameter ensures type safety from MongoDB.
    return db.collection<Omit<ApiKey, 'id'>>('api_keys');
}

/**
 * Validates an API key against the database.
 * @param key The API key string to validate.
 * @returns The ApiKey object if valid, otherwise null.
 */
export async function validateApiKey(key: string): Promise<ApiKey | null> {
  if (!key) return null;
  try {
    const apiKeysCollection = await getApiKeyCollection();
    const apiKeyData = await apiKeysCollection.findOne({ key });
    
    if (!apiKeyData || !apiKeyData.enabled) {
      return null;
    }
    
    // Atomically increment the request count and update the last used timestamp
    await apiKeysCollection.updateOne(
        { _id: apiKeyData._id },
        { 
            $inc: { requestCount: 1 },
            $set: { lastUsed: new Date().toISOString() }
        }
    );
    
    // Map the MongoDB document to our application's ApiKey type
    return mapMongoId(apiKeyData as any) as ApiKey;
  } catch (error) {
    console.error("API Key validation error:", error);
    return null;
  }
}

// Utility to map _id to id
function mapMongoId<T extends { _id: ObjectId }>(doc: T): Omit<T, '_id'> & { id: string } {
  const { _id, ...rest } = doc;
  return { ...rest, id: _id.toString() };
}
