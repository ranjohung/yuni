/**
 * Redis 配置与连接
 */
const redis = require('redis');

let client = null;

async function initRedis() {
  client = redis.createClient({
    url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`
  });
  
  client.on('error', (err) => {
    console.warn('[Redis] 连接错误:', err.message);
  });
  
  try {
    await client.connect();
  } catch (err) {
    console.warn('[Redis] 连接失败，缓存功能降级:', err.message);
    // Redis 不是强依赖，连接失败不影响主服务
  }
  
  return client;
}

function getRedis() {
  return client;
}

async function cacheGet(key) {
  if (!client || !client.isOpen) return null;
  try {
    const val = await client.get(key);
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
}

async function cacheSet(key, value, ttlSeconds = 3600) {
  if (!client || !client.isOpen) return;
  try {
    await client.setEx(key, ttlSeconds, JSON.stringify(value));
  } catch {
    // 缓存失败不影响业务
  }
}

async function cacheDel(key) {
  if (!client || !client.isOpen) return;
  try {
    await client.del(key);
  } catch {
    // 忽略
  }
}

module.exports = { initRedis, getRedis, cacheGet, cacheSet, cacheDel };
