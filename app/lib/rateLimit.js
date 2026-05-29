// Memory map to store rolling request counts by client IP address
const rateLimitMap = new Map();

// Periodic garbage collection to automatically clean up expired IP entries every 5 minutes
if (typeof global !== "undefined" && !global.rateLimitGCScheduled) {
  global.rateLimitGCScheduled = true;
  setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of rateLimitMap.entries()) {
      if (now > data.resetTime) {
        rateLimitMap.delete(ip);
      }
    }
  }, 5 * 60 * 1000); // Clean up every 5 minutes
}

/**
 * Simple in-memory IP rate limiter.
 * @param {string} ip - Client IP address.
 * @param {number} limit - Maximum requests allowed in the time window.
 * @param {number} windowMs - Time window duration in milliseconds.
 * @returns {object} { success: boolean, count: number, limit: number, reset: number }
 */
export function rateLimit(ip, limit = 60, windowMs = 60 * 1000) {
  const now = Date.now();
  
  // 1. If IP is new, initialize request tracker
  if (!rateLimitMap.has(ip)) {
    const resetTime = now + windowMs;
    rateLimitMap.set(ip, { count: 1, resetTime });
    return { success: true, count: 1, limit, reset: resetTime };
  }

  const rateData = rateLimitMap.get(ip);
  
  // 2. If the active time window has expired, reset rolling request tracker
  if (now > rateData.resetTime) {
    const resetTime = now + windowMs;
    rateData.count = 1;
    rateData.resetTime = resetTime;
    return { success: true, count: 1, limit, reset: resetTime };
  }

  // 3. Increment request count and block if it exceeds the tier threshold
  rateData.count += 1;
  if (rateData.count > limit) {
    return { success: false, count: rateData.count, limit, reset: rateData.resetTime };
  }

  return { success: true, count: rateData.count, limit, reset: rateData.resetTime };
}
