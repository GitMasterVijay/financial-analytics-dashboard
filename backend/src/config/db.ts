import mongoose from 'mongoose';
import { config } from './index.js';

export async function connectDB(): Promise<typeof mongoose> {
  try {
    const connection = await mongoose.connect(config.mongodbUri);
    console.log(`MongoDB connected: ${connection.connection.host}`);
    return connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export async function disconnectDB(): Promise<void> {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected successfully');
  } catch (error) {
    console.error('MongoDB disconnect error:', error);
    throw error;
  }
}
