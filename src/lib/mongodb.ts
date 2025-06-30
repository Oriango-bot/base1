import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient>;
}

// A global variable is used to hold the client promise to avoid creating a new client
// on every hot reload in development. This pattern is also safe in production.
if (process.env.NODE_ENV === 'development') {
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
    client = new MongoClient(uri, {
        serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
        }
    });
    clientPromise = client.connect();
}


export default clientPromise;
