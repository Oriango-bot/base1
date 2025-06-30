import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
const options = {}

if (!uri) {
  throw new Error('Please add your Mongo URI to .env')
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

// In development, we use a global variable to preserve the value across HMR.
// In production, we also use a global to cache the connection across lambda invocations.
let globalWithMongo = global as typeof globalThis & {
  _mongoClientPromise: Promise<MongoClient>
}

if (!globalWithMongo._mongoClientPromise) {
  client = new MongoClient(uri, options)
  globalWithMongo._mongoClientPromise = client.connect()
}
clientPromise = globalWithMongo._mongoClientPromise

export default clientPromise
