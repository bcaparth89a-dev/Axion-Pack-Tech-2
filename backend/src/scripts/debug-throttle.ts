import { initRedis, getRedisClient, isRedisReady } from '../config/redis.js';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.model.js';
import { Session } from '../models/Session.model.js';

async function main() {
  await connectDB();
  initRedis();
  await new Promise((r) => setTimeout(r, 1000));
  console.log('Redis ready:', isRedisReady());
  if (isRedisReady()) {
    const client = getRedisClient();
    const keys = await client.keys('*throttle*');
    console.log('Throttle keys in Redis:', keys);
    for (const k of keys) {
      const val = await client.get(k);
      const ttl = await client.ttl(k);
      console.log(`Key: ${k} | Val: ${val} | TTL: ${ttl}`);
    }
  }
  const users = await User.find({}).select('email role isActive lastLogin');
  console.log('Users in DB:', users);
  const sessionCount = await Session.countDocuments();
  console.log('Sessions in DB:', sessionCount);
  process.exit(0);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
