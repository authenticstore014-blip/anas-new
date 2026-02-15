
/**
 * Rate Limiting Middleware (Memory-based for Edge/Node environments)
 */
const cache = new Map();

export const rateLimiter = (limit = 100, windowMs = 900000) => {
  return (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const now = Date.now();
    
    if (!cache.has(ip)) {
      cache.set(ip, { count: 1, expires: now + windowMs });
      return next();
    }

    const data = cache.get(ip);
    if (now > data.expires) {
      cache.set(ip, { count: 1, expires: now + windowMs });
      return next();
    }

    if (data.count >= limit) {
      return res.status(429).json({
        error: "Too many requests",
        message: "Rate limit exceeded. Please try again later."
      });
    }

    data.count++;
    next();
  };
};
