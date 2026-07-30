import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id, payload, ttl } = req.body;

    if (!id || !payload || !ttl) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await redis.set(`note:${id}`, JSON.stringify(payload), { ex: ttl });

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}