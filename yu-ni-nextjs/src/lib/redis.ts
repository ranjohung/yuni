const cache = new Map<string, string>();

export const redis = {
  get: async (key: string): Promise<string | null> => {
    return cache.get(key) || null;
  },
  set: async (key: string, value: string): Promise<'OK'> => {
    cache.set(key, value);
    return 'OK';
  },
  incr: async (key: string): Promise<number> => {
    const current = cache.get(key);
    const next = current ? parseInt(current, 10) + 1 : 1;
    cache.set(key, next.toString());
    return next;
  },
  decr: async (key: string): Promise<number> => {
    const current = cache.get(key);
    const next = current ? Math.max(0, parseInt(current, 10) - 1) : 0;
    cache.set(key, next.toString());
    return next;
  },
};

export async function getChatCount(userId: string): Promise<number> {
  const count = await redis.get(`chat:count:${userId}`);
  return count ? parseInt(count, 10) : 0;
}

export async function incrementChatCount(userId: string): Promise<number> {
  return await redis.incr(`chat:count:${userId}`);
}

export async function setChatCount(userId: string, count: number): Promise<void> {
  await redis.set(`chat:count:${userId}`, count.toString());
}

export async function getWeeklySimulations(userId: string): Promise<number> {
  const count = await redis.get(`simulation:weekly:${userId}`);
  return count ? parseInt(count, 10) : 0;
}

export async function incrementWeeklySimulations(userId: string): Promise<number> {
  return await redis.incr(`simulation:weekly:${userId}`);
}