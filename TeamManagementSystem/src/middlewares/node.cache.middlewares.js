import NodeCache from "node-cache";
const rateLimitCache = new NodeCache({
  stdTTL: 0,
  checkperiod: 0.5,
  useClones: false,
});

class TokenBucket {
  constructor(capacity, refillRate) {
    this.capacity = capacity;
    this.tokens = capacity;
    this.refillRate = refillRate;
    this.lastRefillTime = Date.now();
  }
  refill() {
    const now = Date.now();
    const elapsedTime = (now - this.lastRefillTime) / 1000;
    this.tokens = Math.min(
      this.capacity,
      this.tokens + elapsedTime * this.refillRate
    );
    this.lastRefillTime = now;
  }
  consume() {
    this.refill();
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }
    return false;
  }
  getRemainingTokens() {
    this.refill();
    return Math.floor(this.tokens);
  }
  getResetTime() {
    const secondsToFull = (this.capacity - this.tokens) / this.refillRate;
    return new Date(Date.now() + secondsToFull * 1000);
  }
}

const cacheRateLimitMiddleware = (capacity, refillRate) => {
  return async (req, res, next) => {
    const key =
      req.ip || req.headers["x-api-key"] || req.headers["x-forwarded-for"];
    if (!key) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Missing identifier for rate limiting!",
      });
    }
    let bucket = rateLimitCache.get(key);
    if (!bucket) {
      bucket = new TokenBucket(capacity, refillRate);
      rateLimitCache.set(key, bucket);
    }
    if (bucket.consume()) {
      res.setHeader("X-RateLimit-Limit", capacity);
      res.setHeader("X-RateLimit-Remaining", bucket.getRemainingTokens());
      res.setHeader("X-RateLimit-Reset", bucket.getResetTime().toISOString());
      return next();
    }
    res.setHeader("X-RateLimit-Limit", capacity);
    res.setHeader("X-RateLimit-Remaining", 0);
    res.setHeader("X-RateLimit-Reset", bucket.getResetTime().toISOString());
    res.setHeader("Retry-After", Math.ceil(1 / refillRate));
    return res.status(429).json({
      success: false,
      statusCode: 429,
      message: "Too many requests. Please try again later!",
    });
  };
};

export const applyMethodRateLimits = (router, path, methodLimits = {}) => {
  const defaultLimits = {
    GET: { capacity: 2000, refillRate: 200 },
    POST: { capacity: 500, refillRate: 50 },
    PUT: { capacity: 200, refillRate: 20 },
    DELETE: { capacity: 100, refillRate: 10 },
  };
  const limits = { ...defaultLimits, ...methodLimits };
  Object.entries(limits).forEach(([method, { capacity, refillRate }]) => {
    router.use(path, (req, res, next) => {
      if (req.method === method) {
        return cacheRateLimitMiddleware(capacity, refillRate)(req, res, next);
      }
      next();
    });
  });
};

export const invalidateDataCache = (key) => {
  dataCache.del(key);
};

export { rateLimitCache };
