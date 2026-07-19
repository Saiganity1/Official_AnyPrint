interface RateLimitStore {
  [identifier: string]: {
    count: number;
    blockedUntil: Date | null;
  };
}

// In-memory store for rate limiting
// Note: In a true multi-server production environment, this should be backed by Redis.
// For Vercel Serverless Functions, this works per-instance which is sufficient for basic brute-force protection.
const store: RateLimitStore = {};

const MAX_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export const checkRateLimit = (identifier: string): { allowed: boolean; message?: string } => {
  const now = new Date();
  const record = store[identifier];

  if (record) {
    // Check if currently blocked
    if (record.blockedUntil && record.blockedUntil > now) {
      const minutesLeft = Math.ceil((record.blockedUntil.getTime() - now.getTime()) / 60000);
      return { 
        allowed: false, 
        message: `Too many failed attempts. Try again in ${minutesLeft} minute(s).` 
      };
    }
    
    // If block expired, reset
    if (record.blockedUntil && record.blockedUntil <= now) {
      delete store[identifier];
    }
  }

  return { allowed: true };
};

export const recordFailedAttempt = (identifier: string): { allowed: boolean; message?: string } => {
  const now = new Date();
  
  if (!store[identifier]) {
    store[identifier] = { count: 1, blockedUntil: null };
    return { allowed: true };
  }

  store[identifier].count += 1;

  if (store[identifier].count >= MAX_ATTEMPTS) {
    store[identifier].blockedUntil = new Date(now.getTime() + BLOCK_DURATION_MS);
    return { 
      allowed: false, 
      message: "Too many failed attempts. Try again in 15 minutes." 
    };
  }

  return { allowed: true };
};

export const clearRateLimit = (identifier: string) => {
  delete store[identifier];
};
