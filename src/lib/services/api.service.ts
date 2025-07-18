
'use server';
import clientPromise from '@/lib/mongodb';
import { v4 as uuidv4 } from 'uuid';
import type { ApiKey } from '@/lib/types';

async function getApiKeyCollection() {
    const client = await clientPromise;
    const db = client.db("oriango");
    return db.collection<ApiKey>('api_keys');
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
    
    // Optional: Implement rate limiting checks here
    
    return apiKeyData;
  } catch (error) {
    console.error("API Key validation error:", error);
    return null;
  }
}

/**
 * Creates a new API key for a partner.
 * NOTE: This is a placeholder for a more robust admin interface.
 * @param partnerId The ID of the partner to create the key for.
 * @param scopes The permissions for this key.
 * @returns The newly created ApiKey object.
 */
export async function createApiKey(partnerId: number, scopes: string[]): Promise<ApiKey> {
  const apiKeysCollection = await getApiKeyCollection();
  const newKey: ApiKey = {
    key: uuidv4(),
    partnerId,
    scopes,
    enabled: true,
    createdAt: new Date().toISOString(),
    lastUsed: null,
    requestCount: 0,
  };

  await apiKeysCollection.insertOne(newKey);
  console.log(`Generated new API key for partner ${partnerId}`);
  
  return newKey;
}

// Example of how you might create a key for a partner (run this manually or via an admin panel)
// createApiKey(25, ['forms:read', 'forms:write', 'loans:read', 'loans:write']);
