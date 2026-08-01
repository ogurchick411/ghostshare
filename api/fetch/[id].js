import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Missing note ID' });
    }

    const noteKey = `note:${id}`;
    const rawData = await redis.get(noteKey);

    if (!rawData) {
      return res.status(404).json({ error: 'Note not found or expired' });
    }
 
    await redis.del(noteKey);
 
    const payload = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;

    return res.status(200).json({ payload });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}