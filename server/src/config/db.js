import mongoose from 'mongoose';
import dns from 'dns';
import { ENV } from './env.js';

// Prefer IPv4 resolution in cloud container environments
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

let isConnecting = false;
let retryTimer = null;

export const connectDB = async (customUri = null) => {
  const uri = customUri || ENV.MONGODB_URI;

  if (!uri) {
    console.error('[MongoDB] Warning: MONGODB_URI environment variable is missing.');
    return;
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (isConnecting) return;
  isConnecting = true;

  // Mask credentials for clean logging
  const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
  console.log(`[MongoDB] Attempting connection to: ${maskedUri}`);

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    isConnecting = false;
    if (retryTimer) clearTimeout(retryTimer);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);

    // If SRV record lookup failed, attempt fallback resolution using Google/Cloudflare public DNS
    if (error.message.includes('querySrv ENOTFOUND') || error.message.includes('ENOTFOUND')) {
      console.log('[MongoDB] DNS resolution failed on default resolver. Retrying with Public DNS (8.8.8.8, 1.1.1.1)...');
      try {
        dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
        const conn = await mongoose.connect(uri, {
          serverSelectionTimeoutMS: 10000,
        });
        console.log(`[MongoDB] Connected successfully via Public DNS: ${conn.connection.host}/${conn.connection.name}`);
        isConnecting = false;
        if (retryTimer) clearTimeout(retryTimer);
        return conn;
      } catch (retryError) {
        console.error(`[MongoDB] Public DNS retry failed: ${retryError.message}`);
      }
    }

    console.error('[MongoDB] Troubleshooting checklist:');
    console.error(' 1. Check if cluster name in MONGODB_URI has a typo');
    console.error(' 2. Verify MongoDB Atlas cluster is ACTIVE (not paused at cloud.mongodb.com)');
    console.error(' 3. In Atlas > Network Access, ensure 0.0.0.0/0 (Anywhere) is allowed');
    console.error(' 4. Verify database user credentials in Atlas > Database Access');

    isConnecting = false;

    if (process.env.NODE_ENV === 'test') {
      throw error;
    }

    // Schedule background retry so server remains online for cloud healthchecks
    console.log('[MongoDB] Scheduling connection retry in 8 seconds...');
    retryTimer = setTimeout(() => {
      connectDB(uri);
    }, 8000);
  }
};

export const disconnectDB = async () => {
  if (retryTimer) clearTimeout(retryTimer);
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('[MongoDB] Disconnected');
    }
  } catch (error) {
    console.error(`[MongoDB] Disconnect error: ${error.message}`);
  }
};

