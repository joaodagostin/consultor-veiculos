const cacheStore = new Map();

export function getCache(key) {
  const cached = cacheStore.get(key);

  if (!cached) return null;

  const now = Date.now();
  if (cached.expiresAt < now) {
    cacheStore.delete(key);
    return null;
  }

  return cached.value;
}

export function setCache(key, value, ttlMs = 1000 * 60 * 60 * 24) {
  cacheStore.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
}