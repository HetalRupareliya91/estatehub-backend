// Small in-memory, fixed-window rate limiter. No new dependency required.
//
// Good enough for a single-process API like this one. If the backend ever
// runs as multiple instances behind a load balancer, swap this for a
// shared store (e.g. express-rate-limit + a Redis store) since each
// instance would otherwise track its own counts.
function rateLimit({ windowMs, max, message }) {
  const hits = new Map(); // key (IP) -> { count, resetAt }

  // periodic cleanup so the map doesn't grow forever; unref so it never
  // keeps the process alive (matters for tests and graceful shutdown)
  const sweep = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) {
      if (now > entry.resetAt) hits.delete(key);
    }
  }, windowMs).unref();
  sweep.unref?.();

  return function rateLimitMiddleware(req, res, next) {
    const key = req.ip;
    const now = Date.now();

    let entry = hits.get(key);
    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(key, entry);
    }

    entry.count += 1;

    if (entry.count > max) {
      const retryAfterSec = Math.max(Math.ceil((entry.resetAt - now) / 1000), 1);
      res.set('Retry-After', String(retryAfterSec));
      return res.status(429).json({ message: message || 'Too many requests, please try again later.' });
    }

    next();
  };
}

module.exports = rateLimit;
