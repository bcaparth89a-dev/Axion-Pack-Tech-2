import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

// Ensure .env is loaded even if db.ts is imported directly
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

interface MongoConfig {
  uri: string;
  maxPoolSize: number;
  minPoolSize: number;
  serverSelectionTimeoutMS: number;
  socketTimeoutMS: number;
}

const getMongoConfig = (): MongoConfig => {
  let uri = process.env.MONGODB_URI;

  if (!uri) {
    const user =
      process.env.MONGO_INITDB_ROOT_USERNAME ||
      process.env.MONGO_ROOT_USER ||
      process.env.MONGO_USER;
    const password =
      process.env.MONGO_INITDB_ROOT_PASSWORD ||
      process.env.MONGO_ROOT_PASSWORD ||
      process.env.MONGO_PASSWORD;
    const host = process.env.MONGO_HOST || 'localhost';
    const port = process.env.MONGO_PORT || '27017';
    const database =
      process.env.MONGO_INITDB_DATABASE ||
      process.env.MONGO_DATABASE ||
      'axion_packtech';
    const authSource =
      process.env.MONGO_AUTH_SOURCE || (user ? 'admin' : undefined);

    if (user && password) {
      const encodedUser = encodeURIComponent(user);
      const encodedPass = encodeURIComponent(password);
      const authQuery = authSource ? `?authSource=${encodeURIComponent(authSource)}` : '';
      uri = `mongodb://${encodedUser}:${encodedPass}@${host}:${port}/${database}${authQuery}`;
    } else {
      uri = `mongodb://${host}:${port}/${database}`;
    }
  }

  const maxPoolSize = parseInt(process.env.MONGODB_MAX_POOL_SIZE || '50', 10);
  const minPoolSize = parseInt(process.env.MONGODB_MIN_POOL_SIZE || '10', 10);
  const serverSelectionTimeoutMS = parseInt(
    process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || '5000',
    10
  );
  const socketTimeoutMS = parseInt(process.env.MONGODB_SOCKET_TIMEOUT_MS || '45000', 10);

  return {
    uri,
    maxPoolSize,
    minPoolSize,
    serverSelectionTimeoutMS,
    socketTimeoutMS,
  };
};

let isConnected = false;

export const connectDB = async (): Promise<typeof mongoose> => {
  if (isConnected) {
    return mongoose;
  }

  const config = getMongoConfig();
  const connectOptions: mongoose.ConnectOptions = {
    maxPoolSize: config.maxPoolSize,
    minPoolSize: config.minPoolSize,
    serverSelectionTimeoutMS: config.serverSelectionTimeoutMS,
    socketTimeoutMS: config.socketTimeoutMS,
    autoIndex: process.env.NODE_ENV !== 'production',
  };

  try {
    let conn: typeof mongoose;
    try {
      conn = await mongoose.connect(config.uri, connectOptions);
    } catch (initialError: unknown) {
      const errorMsg = initialError instanceof Error ? initialError.message : String(initialError);
      if (
        config.uri.includes('localhost') &&
        (errorMsg.includes('::1') || errorMsg.includes('closed') || errorMsg.includes('ECONNREFUSED'))
      ) {
        const fallbackUri = config.uri
          .replace(/@localhost(:|\/)/, '@127.0.0.1$1')
          .replace(/\/\/localhost(:|\/)/, '//127.0.0.1$1');
        logger.warn('Connection via localhost failed (IPv6 resolution). Retrying connection with 127.0.0.1...');
        conn = await mongoose.connect(fallbackUri, connectOptions);
      } else {
        throw initialError;
      }
    }

    isConnected = true;
    logger.info(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB runtime connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB connection lost. Reconnecting...');
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB connection re-established.');
      isConnected = true;
    });

    return conn;
  } catch (error) {
    const errorStr = error instanceof Error ? error.message : String(error);
    const sanitizedMsg = errorStr.replace(/mongodb:\/\/[^@]+@/g, 'mongodb://***:***@');
    logger.error(`Failed to connect to MongoDB: ${sanitizedMsg}`);
    throw error;
  }
};

export const disconnectDB = async (): Promise<void> => {
  if (!isConnected) {
    return;
  }
  try {
    await mongoose.connection.close();
    isConnected = false;
    logger.info('MongoDB connection pool gracefully closed.');
  } catch (error) {
    logger.error('Error closing MongoDB connection pool:', error);
    throw error;
  }
};

export const getDBStatus = (): 'connected' | 'disconnected' | 'connecting' | 'disconnecting' => {
  switch (mongoose.connection.readyState) {
    case 0:
      return 'disconnected';
    case 1:
      return 'connected';
    case 2:
      return 'connecting';
    case 3:
      return 'disconnecting';
    default:
      return 'disconnected';
  }
};
