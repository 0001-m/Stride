import mongoose from 'mongoose';

/**
 * Connects to MongoDB using the URI from environment variables.
 * Called once when the Express server starts.
 */
export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set in .env');
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log('MongoDB connected');
}
