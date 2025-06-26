import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = process.env.MONGODB_URI;

// We need a lazy-loaded promise to avoid throwing an error at build time
// if the environment variable isn't set.
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!uri) {
  console.warn(
    'Warning: MONGODB_URI environment variable is not defined. Database connections will fail at runtime.'
  );
  // Create a dummy promise that will be rejected if ever used.
  // This allows the build to pass but will cause runtime errors if the DB is accessed.
  clientPromise = Promise.reject(
    new Error('Please define the MONGODB_URI environment variable')
  );
} else {
    if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    if (!global._mongoClientPromise) {
        client = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
        });
        global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
    } else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(uri, {
        serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
        }
    });
    clientPromise = client.connect();
    }
}


declare global {
  var _mongoClientPromise: Promise<MongoClient>;
}

export default clientPromise;
